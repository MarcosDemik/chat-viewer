// @ts-nocheck

import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs"; // <-- NOVO
import Database from "better-sqlite3";

const DB_PATH =
  process.env.DB_PATH ||
  "C:/Users/TI/Documents/ChatScript/whatsapp_chats_todos.db";

const ATTACHMENTS_ROOT =
  process.env.ATTACHMENTS_ROOT ||
  "C:/Users/TI/Desktop/Backup Joseane - PessoaPessoa/Anexos";

const app = express();
app.use(cors());

const db = new Database(DB_PATH, { readonly: true });

/**
 * Lista chats agrupando por nome_contato
 */
app.get("/api/chats", (req: Request, res: Response) => {
  try {
    const rows = db
      .prepare(
        `
        SELECT 
          nome_contato            AS chat_name,
          COUNT(*)                AS total_mensagens,
          MIN(data_hora_envio)    AS primeira_msg,
          MAX(data_hora_envio)    AS ultima_msg
        FROM messages
        WHERE nome_contato IS NOT NULL AND nome_contato <> ''
        GROUP BY nome_contato
        ORDER BY ultima_msg DESC
      `
      )
      .all();

    res.json(rows);
  } catch (err: any) {
    console.error("ERRO /api/chats:", err);
    res.status(500).json({
      error: "Erro ao listar chats",
      detail: String(err),
    });
  }
});

/**
 * Lista mensagens de um contato pelo nome_contato, com paginação
 * Exemplo:
 *   GET /api/messages?nome=Marcos%20Onix%20Mkt&limit=300&offset=0
 */
app.get("/api/messages", (req: Request, res: Response) => {
  const nome = req.query.nome as string;
  const limit = Number(req.query.limit || 300);
  const offset = Number(req.query.offset || 0);

  if (!nome) {
    return res
      .status(400)
      .json({ error: "Parâmetro 'nome' é obrigatório (nome_contato)" });
  }

  console.log("GET /api/messages nome=", nome, "limit=", limit, "offset=", offset);

  try {
    const rows = db
      .prepare(
        `
        SELECT 
          id,
          nome_contato,
          data_hora_envio,
          tipo_mensagem,
          texto_mensagem,
          source_file,
          anexo_id_arquivo,
          anexo_tipo,
          anexo_tamanho
        FROM messages
        WHERE nome_contato = ?
        ORDER BY data_hora_envio ASC
        LIMIT ? OFFSET ?
      `
      )
      .all(nome, limit, offset);

    res.json(rows);
  } catch (err: any) {
    console.error("ERRO /api/messages:", err);
    res.status(500).json({
      error: "Erro ao listar mensagens",
      detail: String(err),
    });
  }
});

/**
 * Servir anexos por ID ou nome
 *
 * Exemplo de arquivo no disco:
 *  "2023-11-30 17 09 46 - ... - 8f8bbe31-d1c2-4d0e-b5fe-3b51d92f3e66.mp3"
 *
 * No banco:
 *  anexo_id_arquivo = "8f8bbe31-d1c2-4d0e-b5fe-3b51d92f3e66"
 *
 * GET /api/attachments/8f8bbe31-d1c2-4d0e-b5fe-3b51d92f3e66
 * -> procura um arquivo na pasta cujo nome contenha esse ID.
 */
app.get("/api/attachments/:id", (req: Request, res: Response) => {
  const idRaw = req.params.id; // ex: "503800a3-e942-4cdb-a736-015e3bfd6d01.opus"
  if (!idRaw) {
    return res.status(400).json({ error: "ID do anexo não informado" });
  }

  // ID base sem extensão, para encontrar .mp3/.jpg/etc mesmo se no banco vier ".opus"
  const idBase = idRaw.replace(/\.[^/.]+$/, "");

  const sendFileSafe = (fullPath: string, context: string) => {
    console.log(`GET /api/attachments (${context}):`, fullPath);

    res.sendFile(fullPath, (err) => {
      if (!err) return;

      console.error(`ERRO /api/attachments (${context}):`, err);

      // Cliente cancelou / fechou a aba -> só loga, não tenta responder de novo
      if ((err as any).code === "ECONNABORTED" || (err as any).code === "ECONNRESET") {
        return;
      }

      // Se já mandou header, não pode mandar mais nada
      if (res.headersSent) {
        return;
      }

      res.status(500).json({ error: "Erro ao enviar anexo" });
    });
  };

  try {
    // 1) tenta direto como nome de arquivo exato
    const directPath = path.join(ATTACHMENTS_ROOT, idRaw);
    if (fs.existsSync(directPath)) {
      return sendFileSafe(directPath, "direct");
    }

    // 2) procura por um arquivo cujo nome contenha o idRaw OU o idBase
    const files = fs.readdirSync(ATTACHMENTS_ROOT);

    const match = files.find(
      (name) => name.includes(idRaw) || name.includes(idBase)
    );

    if (match) {
      const fullPath = path.join(ATTACHMENTS_ROOT, match);
      return sendFileSafe(fullPath, "id match");
    }

    console.warn(
      `Anexo NÃO encontrado. idRaw="${idRaw}", idBase="${idBase}" | Pasta: ${ATTACHMENTS_ROOT}`
    );
    if (!res.headersSent) {
      return res.status(404).json({ error: "Anexo não encontrado" });
    }
  } catch (err) {
    console.error("ERRO /api/attachments (readdir):", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Erro ao procurar anexo" });
    }
  }
});


const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API ouvindo em http://0.0.0.0:${PORT}`);
});
