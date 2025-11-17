import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: 'list_conversations' | 'get_messages' | 'search_messages';
  dbFile: string; // base64 encoded SQLite file
  conversationId?: string;
  limit?: number;
  offset?: number;
  searchTerm?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, dbFile, conversationId, limit = 400, offset = 0, searchTerm }: RequestBody = await req.json();

    console.log(`Processing action: ${action}`);

    // Decode base64 and save to temporary file
    const binaryData = Uint8Array.from(atob(dbFile), c => c.charCodeAt(0));
    const tempFilePath = `/tmp/whatsapp_${Date.now()}.db`;
    await Deno.writeFile(tempFilePath, binaryData);

    // Open SQLite database
    const db = new DB(tempFilePath);

    let result;

    switch (action) {
      case 'list_conversations':
        result = listConversations(db);
        break;
      
      case 'get_messages':
        if (!conversationId) {
          throw new Error('conversationId is required for get_messages');
        }
        result = getMessages(db, conversationId, limit, offset);
        break;
      
      case 'search_messages':
        if (!conversationId || !searchTerm) {
          throw new Error('conversationId and searchTerm are required for search_messages');
        }
        result = searchMessages(db, conversationId, searchTerm);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Close database and clean up
    db.close();
    await Deno.remove(tempFilePath);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function listConversations(db: DB) {
  console.log('Listing conversations...');
  
  // CRITICAL: Use exact column names from the database, never rename them
  const query = `
    SELECT 
      nome_contato,
      source_file,
      COUNT(*) as message_count
    FROM messages
    GROUP BY nome_contato, source_file
    ORDER BY MAX(data_hora_envio) DESC
  `;

  const conversations = [];
  
  for (const [nome_contato, source_file, message_count] of db.query(query)) {
    // Create a simple hash for conversation ID
    const id = btoa(`${nome_contato}_${source_file}`).replace(/[^a-zA-Z0-9]/g, '');
    
    conversations.push({
      id,
      nome_contato,
      source_file,
      messageCount: message_count,
    });
  }

  console.log(`Found ${conversations.length} conversations`);
  
  return { conversations };
}

function getMessages(db: DB, conversationId: string, limit: number, offset: number) {
  console.log(`Getting messages for conversation: ${conversationId}, limit: ${limit}, offset: ${offset}`);
  
  // Decode conversation ID to get nome_contato and source_file
  const decoded = atob(conversationId.replace(/[^a-zA-Z0-9+/=]/g, ''));
  const [nome_contato, source_file] = decoded.split('_');

  // CRITICAL: Use exact column names from database, never rename or transform them
  // Load messages in reverse order (oldest first for pagination from top)
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
    ORDER BY data_hora_envio ASC
    LIMIT ? OFFSET ?
  `;

  const messages = [];
  
  for (const row of db.query(query, [nome_contato, source_file, limit, offset])) {
    // CRITICAL: Map columns exactly as they are in the database
    // Never transform anexo_tipo or any other field - use literal values
    messages.push({
      id: row[0],
      nome_contato: row[1],
      data_hora_envio: row[2],
      tipo_mensagem: row[3],
      nome_remetente_grupo: row[4],
      status_mensagem: row[5],
      texto_mensagem: row[6],
      anexo_tipo: row[7], // CRITICAL: Use exact value from DB, never infer or transform
      anexo_tamanho: row[8],
      anexo_id_arquivo: row[9],
    });
  }

  // Check if there are more messages
  const countQuery = `
    SELECT COUNT(*) 
    FROM messages 
    WHERE nome_contato = ? AND source_file = ?
  `;
  const [[totalCount]] = db.query(countQuery, [nome_contato, source_file]);
  const hasMore = (offset + limit) < Number(totalCount);

  console.log(`Loaded ${messages.length} messages, hasMore: ${hasMore}`);

  return { messages, hasMore };
}

function searchMessages(db: DB, conversationId: string, searchTerm: string) {
  console.log(`Searching messages in conversation: ${conversationId}, term: ${searchTerm}`);
  
  // Decode conversation ID
  const decoded = atob(conversationId.replace(/[^a-zA-Z0-9+/=]/g, ''));
  const [nome_contato, source_file] = decoded.split('_');

  // CRITICAL: Search uses exact column names from database
  // Search across entire conversation, not just loaded messages
  const query = `
    SELECT id
    FROM messages
    WHERE nome_contato = ? 
      AND source_file = ?
      AND texto_mensagem LIKE ?
    ORDER BY data_hora_envio ASC
  `;

  const messageIds = [];
  const searchPattern = `%${searchTerm}%`;
  
  for (const [id] of db.query(query, [nome_contato, source_file, searchPattern])) {
    messageIds.push(id);
  }

  console.log(`Found ${messageIds.length} matching messages`);

  return { messageIds };
}
