import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "@/lib/sqlite-processor";
import type { AttachmentManager } from "@/lib/attachment-manager";
import { AttachmentPreview } from "./AttachmentPreview";

interface MessageBubbleProps {
  message: Message;
  attachmentManager: AttachmentManager | null;
  isHighlighted?: boolean;
}

export const MessageBubble = ({ message, attachmentManager, isHighlighted }: MessageBubbleProps) => {
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

        {/* Attachment preview - CRÍTICO: busca por nome base, ignora extensão */}
        {message.anexo_id_arquivo && message.anexo_tipo && (
          <AttachmentPreview
            anexoIdArquivo={message.anexo_id_arquivo}
            anexoTipo={message.anexo_tipo}
            anexoTamanho={message.anexo_tamanho}
            attachmentManager={attachmentManager}
          />
        )}

        {/* Message text */}
        {message.texto_mensagem && (
          <div className="break-words whitespace-pre-wrap">
            {message.texto_mensagem}
          </div>
        )}
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
