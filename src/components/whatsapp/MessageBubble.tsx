import { cn } from "@/lib/utils";
import { Check, CheckCheck, FileText } from "lucide-react"; // <- adicionei FileText
import type { Message } from "@/lib/sqlite-processor";
import { AttachmentPreview } from "./AttachmentPreview";

interface MessageBubbleProps {
  message: Message;
  isHighlighted?: boolean;
}

export const MessageBubble = ({
  message,
  isHighlighted,
}: MessageBubbleProps) => {
  const isSent = message.tipo_mensagem === "Enviadas";
  const isDelivered = message.status_mensagem === "Entregue";
  const isRead = message.status_mensagem === "Lida";

  const isNotification =
    message.tipo_mensagem?.toLowerCase() === "notificação";

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Notificações centralizadas
  if (isNotification) {
    return (
      <div
        className={cn(
          "flex w-full justify-center my-2",
          isHighlighted && "ring-2 ring-search-highlight rounded-full"
        )}
      >
        <div className="max-w-[80%] rounded-full bg-message-received text-message-received-foreground px-3 py-1 text-xs text-center shadow-sm">
          <span className="break-words whitespace-pre-wrap">
            {message.texto_mensagem}
          </span>
        </div>
      </div>
    );
  }

  // Mensagens normais
  return (
    <div className={cn("flex", isSent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2 shadow-sm transition-colors",
          isSent
            ? "bg-message-sent text-message-sent-foreground"
            : "bg-message-received text-message-received-foreground",
          isHighlighted && "ring-2 ring-search-highlight"
        )}
      >
        {/* Nome do remetente em grupos */}
        {message.nome_remetente_grupo && (
          <div className="mb-1 text-xs font-semibold text-primary">
            {message.nome_remetente_grupo}
          </div>
        )}

        {/* FALLOFF: tem tipo de anexo mas NÃO tem arquivo/id -> mostrar "documento não encontrado" */}
        {message.anexo_tipo && !message.anexo_id_arquivo && (
          <div className="mb-2 flex items-center gap-2 rounded bg-background/50 p-2 text-xs">
            <FileText className="h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium">
                {message.anexo_tipo} não encontrado
              </div>
              <div className="text-[11px] text-muted-foreground">
                Arquivo de mídia não está presente neste backup.
              </div>
            </div>
          </div>
        )}

        {/* Anexo normal (quando temos id_arquivo) */}
        {message.anexo_id_arquivo && message.anexo_tipo && (
          <AttachmentPreview
            anexoIdArquivo={message.anexo_id_arquivo}
            anexoTipo={message.anexo_tipo}
            anexoTamanho={message.anexo_tamanho}
          />
        )}

        {/* Texto da mensagem */}
        {message.texto_mensagem && (
          <div className="break-words whitespace-pre-wrap">
            {message.texto_mensagem}
          </div>
        )}

        {/* Rodapé: data + status */}
        <div className="mt-1 flex items-center justify-end gap-1 text-xs opacity-70">
          <span>{formatDateTime(message.data_hora_envio)}</span>
          {isSent && (
            <>
              {isRead ? (
                <CheckCheck className="h-3 w-3 text-primary" />
              ) : isDelivered ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
