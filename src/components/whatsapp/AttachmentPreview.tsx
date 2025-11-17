import { Paperclip, Image, Video, Music, FileText } from "lucide-react";
import { AttachmentManager } from "@/lib/attachment-manager";

interface AttachmentPreviewProps {
  anexoIdArquivo: string;
  anexoTipo: string;
  anexoTamanho: string | null;
  attachmentManager: AttachmentManager | null;
}

export const AttachmentPreview = ({
  anexoIdArquivo,
  anexoTipo,
  anexoTamanho,
  attachmentManager,
}: AttachmentPreviewProps) => {
  const formatFileSize = (bytes: string | null) => {
    if (!bytes) return '';
    const size = parseInt(bytes);
    if (isNaN(size)) return bytes;
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Tenta obter o anexo real pelo nome base
  const attachmentURL = attachmentManager?.getAttachmentURL(anexoIdArquivo);
  const mediaType = attachmentManager?.getMediaType(anexoIdArquivo);
  const realFileName = attachmentManager?.getAttachment(anexoIdArquivo)?.name;

  // Ícone baseado no tipo LITERAL do banco (não deduzido)
  const getIconByType = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    
    if (tipoLower.includes('imagem') || tipoLower === 'image') {
      return <Image className="h-4 w-4" />;
    }
    if (tipoLower.includes('video') || tipoLower === 'vídeo') {
      return <Video className="h-4 w-4" />;
    }
    if (tipoLower.includes('áudio') || tipoLower.includes('audio')) {
      return <Music className="h-4 w-4" />;
    }
    if (tipoLower.includes('documento') || tipoLower === 'document') {
      return <FileText className="h-4 w-4" />;
    }
    
    return <Paperclip className="h-4 w-4" />;
  };

  // Se temos o anexo real, renderizar preview
  if (attachmentURL && mediaType) {
    return (
      <div className="mb-2 space-y-2">
        {/* Preview visual */}
        {mediaType === 'image' && (
          <div className="rounded-lg overflow-hidden bg-background/20 max-w-sm">
            <img 
              src={attachmentURL} 
              alt={anexoIdArquivo}
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        )}
        
        {mediaType === 'video' && (
          <div className="rounded-lg overflow-hidden bg-background/20 max-w-sm">
            <video 
              src={attachmentURL} 
              controls
              className="w-full h-auto max-h-64"
            >
              Seu navegador não suporta vídeo.
            </video>
          </div>
        )}
        
        {mediaType === 'audio' && (
          <div className="rounded-lg bg-background/20 p-2">
            <audio 
              src={attachmentURL} 
              controls
              className="w-full"
            >
              Seu navegador não suporta áudio.
            </audio>
          </div>
        )}

        {/* Info do arquivo */}
        <div className="flex items-center gap-2 rounded bg-background/50 p-2 text-xs">
          {getIconByType(anexoTipo)}
          <div className="flex-1">
            <div className="font-medium">
              {anexoTipo} {anexoTamanho && `• ${formatFileSize(anexoTamanho)}`}
            </div>
            <div className="text-muted-foreground truncate">
              {realFileName || anexoIdArquivo}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: apenas info do arquivo (anexo não carregado)
  return (
    <div className="mb-2 flex items-center gap-2 rounded bg-background/50 p-2 text-xs">
      {getIconByType(anexoTipo)}
      <div className="flex-1">
        <div className="font-medium">
          {anexoTipo} {anexoTamanho && `• ${formatFileSize(anexoTamanho)}`}
        </div>
        <div className="text-muted-foreground truncate">
          {anexoIdArquivo}
        </div>
        {!attachmentManager?.hasAttachments() && (
          <div className="text-muted-foreground text-[10px] mt-1">
            Carregue a pasta de anexos para visualizar
          </div>
        )}
      </div>
    </div>
  );
};
