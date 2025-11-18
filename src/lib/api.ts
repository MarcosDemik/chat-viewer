export type ChatSummary = {
  chat_name: string;
  total_mensagens: number;
  primeira_msg: string;
  ultima_msg: string;
};

export type MessageRow = {
  id: number;
  nome_contato: string;
  data_hora_envio: string;
  tipo_mensagem: string;
  texto_mensagem: string | null;
  source_file: string | null;
  anexo_id_arquivo: string | null;
  anexo_tipo: string | null;
  anexo_tamanho: number | null;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export async function fetchChats(): Promise<ChatSummary[]> {
  const res = await fetch(`${API_BASE}/api/chats`);
  if (!res.ok) {
    throw new Error("Falha ao carregar lista de chats");
  }
  return res.json();
}

export async function fetchMessages(
  nomeContato: string,
  limit = 300,
  offset = 0
): Promise<MessageRow[]> {
  const params = new URLSearchParams({
    nome: nomeContato,
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`${API_BASE}/api/messages?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Falha ao carregar mensagens");
  }
  return res.json();
}

export function buildAttachmentUrl(fileName: string) {
  if (!fileName) return "";
  // aqui você pode ajustar se tiver pasta interna etc
  return `${API_BASE}/api/attachments/${encodeURIComponent(fileName)}`;
}
