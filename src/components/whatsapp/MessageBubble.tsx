import { cn } from "@/lib/utils";
import { Check, CheckCheck, Paperclip } from "lucide-react";
import type { Message } from "@/lib/sqlite-processor";

interface MessageBubbleProps {
  message: Message;
  isHighlighted?: boolean;
}

export const MessageBubble = ({ message, isHighlighted }: MessageBubbleProps) => {
  const isSent = message.tipo_mensagem === 'Enviadas';
  const isDelivered = message.status_mensagem === 'Entregue';
  const isRead = message.status_mensagem === 'Lida';

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatFileSize = (bytes: string | null) => {
    if (!bytes) return '';
    const size = parseInt(bytes);
    if (isNaN(size)) return bytes;
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={cn(
        "flex",
        isSent ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2 shadow-sm transition-colors",
          isSent 
            ? "bg-message-sent text-message-sent-foreground" 
            : "bg-message-received text-message-received-foreground",
          isHighlighted && "ring-2 ring-search-highlight"
        )}
      >
        {/* Group sender name */}
        {message.nome_remetente_grupo && (
          <div className="mb-1 text-xs font-semibold text-primary">
            {message.nome_remetente_grupo}
          </div>
        )}

        {/* Attachment info */}
        {message.anexo_tipo && (
          <div className="mb-2 flex items-center gap-2 rounded bg-background/50 p-2 text-xs">
            <Paperclip className="h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium">
                {message.anexo_tipo} {message.anexo_tamanho && `• ${formatFileSize(message.anexo_tamanho)}`}
              </div>
              {message.anexo_id_arquivo && (
                <div className="text-muted-foreground truncate">
                  {message.anexo_id_arquivo}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message text */}
        {message.texto_mensagem && (
          <div className="break-words whitespace-pre-wrap">
            {message.texto_mensagem}
          </div>
        )}

        {/* Message footer */}
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
