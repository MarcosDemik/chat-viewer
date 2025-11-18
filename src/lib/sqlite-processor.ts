import initSqlJs, { Database } from 'sql.js';

let SQL: any = null;

// Initialize SQL.js (only once)
export async function initSQLite() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });
  }
  return SQL;
}

export interface Conversation {
  id: string;
  nome_contato: string;
  source_file: string;
  messageCount: number;
}

export interface Message {
  id: number;
  nome_contato: string;
  data_hora_envio: string;
  tipo_mensagem: string;
  nome_remetente_grupo: string | null;
  status_mensagem: string | null;
  texto_mensagem: string | null;
  anexo_tipo: string | null;
  anexo_tamanho: string | null;
  anexo_id_arquivo: string | null;
}

// converte string UTF-8 para base64 sem estourar no btoa
function btoaUtf8(str: string): string {
  const utf8 = encodeURIComponent(str).replace(
    /%([0-9A-F]{2})/g,
    (_, hex) => String.fromCharCode(parseInt(hex, 16))
  );
  return window.btoa(utf8);
}

function atobUtf8(b64: string): string {
  const bin = window.atob(b64);
  let result = "";
  for (let i = 0; i < bin.length; i++) {
    const hex = bin.charCodeAt(i).toString(16).padStart(2, "0");
    result += "%" + hex;
  }
  return decodeURIComponent(result);
}

export class SQLiteProcessor {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  static async fromFile(file: File): Promise<SQLiteProcessor> {
    const SQL = await initSQLite();
    const buffer = await file.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buffer));
    return new SQLiteProcessor(db);
  }

  // CRITICAL: Use exact column names from database, never rename them
  listConversations(): Conversation[] {
    const query = `
      SELECT 
        nome_contato,
        source_file,
        COUNT(*) as message_count
      FROM messages
      GROUP BY nome_contato, source_file
      ORDER BY MAX(data_hora_envio) DESC
    `;

    const result = this.db.exec(query);
    
    if (!result.length || !result[0].values.length) {
      return [];
    }

    const conversations: Conversation[] = [];
    
    for (const row of result[0].values) {
      const [nome_contato, source_file, message_count] = row as [string, string, number];

      // ID da conversa como JSON codificado em base64 UTF-8
      const idPayload = { nome_contato, source_file };
      const id = btoaUtf8(JSON.stringify(idPayload));

      conversations.push({
        id,
        nome_contato,
        source_file,
        messageCount: message_count,
      });
    }

    console.log(`Found ${conversations.length} conversations`);
    return conversations;
  }

  // CRITICAL: Use exact column names from database, never rename or transform them
  getMessages(
    conversationId: string,
    limit: number,
    offset: number
  ): { messages: Message[]; hasMore: boolean } {
    console.log(
      `Getting messages for conversation: ${conversationId}, limit: ${limit}, offset: ${offset}`
    );
    
    // Decode conversation ID to get nome_contato and source_file
    const decodedJson = atobUtf8(conversationId);
    const { nome_contato, source_file } = JSON.parse(decodedJson);

    // Usa a ordem natural do banco (id ASC), que já segue a cronologia
    const query = `
      SELECT 
        id,
        nome_contato,
        data_hora_envio,
        tipo_mensagem,
        nome_remetente_grupo,
        status_mensagem,
        texto_mensagem,
        anexo_tipo,
        anexo_tamanho,
        anexo_id_arquivo
      FROM messages
      WHERE nome_contato = ? AND source_file = ?
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `;

    const result = this.db.exec(query, [nome_contato, source_file, limit, offset]);
    
    const messages: Message[] = [];
    
    if (result.length && result[0].values.length) {
      for (const row of result[0].values) {
        messages.push({
          id: row[0] as number,
          nome_contato: row[1] as string,
          data_hora_envio: row[2] as string,
          tipo_mensagem: row[3] as string,
          nome_remetente_grupo: row[4] as string | null,
          status_mensagem: row[5] as string | null,
          texto_mensagem: row[6] as string | null,
          anexo_tipo: row[7] as string | null,
          anexo_tamanho: row[8] as string | null,
          anexo_id_arquivo: row[9] as string | null,
        });
      }
    }

    // Check if there are more messages
    const countQuery = `
      SELECT COUNT(*) 
      FROM messages 
      WHERE nome_contato = ? AND source_file = ?
    `;
    const countResult = this.db.exec(countQuery, [nome_contato, source_file]);
    const totalCount = (countResult[0]?.values[0]?.[0] as number) || 0;
    const hasMore = offset + limit < totalCount;

    console.log(`Loaded ${messages.length} messages, hasMore: ${hasMore}`);

    return { messages, hasMore };
  }

  // Índice 0-based de uma mensagem dentro da conversa, usado para "ir até a mensagem pesquisada"
  getMessageIndex(conversationId: string, messageId: number): number | null {
    console.log(
      `Getting index for message ${messageId} in conversation ${conversationId}`
    );

    const decodedJson = atobUtf8(conversationId);
    const { nome_contato, source_file } = JSON.parse(decodedJson);

    const query = `
      SELECT COUNT(*)
      FROM messages
      WHERE nome_contato = ?
        AND source_file = ?
        AND id <= ?
    `;

    const result = this.db.exec(query, [
      nome_contato,
      source_file,
      messageId,
    ]);

    if (!result.length || !result[0].values.length) {
      return null;
    }

    const count = result[0].values[0][0] as number;
    if (typeof count !== "number") return null;

    const index = Math.max(0, count - 1);
    console.log(`Message ${messageId} has index ${index}`);
    return index;
  }

  // CRITICAL: Search uses exact column names from database
  searchMessages(conversationId: string, searchTerm: string): number[] {
    console.log(`Searching messages in conversation: ${conversationId}, term: ${searchTerm}`);
    
    // Decode conversation ID
    const decodedJson = atobUtf8(conversationId);
    const { nome_contato, source_file } = JSON.parse(decodedJson);

    // Search across entire conversation, not just loaded messages
    const query = `
      SELECT id
      FROM messages
      WHERE nome_contato = ? 
        AND source_file = ?
        AND texto_mensagem LIKE ?
      ORDER BY id ASC
    `;

    const searchPattern = `%${searchTerm}%`;
    const result = this.db.exec(query, [nome_contato, source_file, searchPattern]);
    
    const messageIds: number[] = [];
    
    if (result.length && result[0].values.length) {
      for (const row of result[0].values) {
        messageIds.push(row[0] as number);
      }
    }

    console.log(`Found ${messageIds.length} matching messages`);

    return messageIds;
  }

  close() {
    this.db.close();
  }
}
