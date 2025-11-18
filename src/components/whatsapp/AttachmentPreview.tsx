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
    if (!bytes) return "";
    const size = parseInt(bytes);
    if (isNaN(size)) return bytes;

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Infos do anexo real (quando a pasta de anexos foi carregada)
  const attachmentURL = attachmentManager?.getAttachmentURL(anexoIdArquivo);
  const mediaType = attachmentManager?.getMediaType(anexoIdArquivo);
  const realFile = attachmentManager?.getAttachment(anexoIdArquivo);
  const realFileName = realFile?.name || anexoIdArquivo;

  // Detecta extensão só para decidir COMO renderizar (imagem/pdf/etc),
  // sem mudar o tipo vindo do banco.
  const baseName = realFileName.split(/[\\/]/).pop() ?? realFileName;
  const ext = baseName.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";

  const mt = (mediaType || "").toLowerCase();
  const isImageMedia = mt === "image" || mt.startsWith("image/");
  const isVideoMedia = mt === "video" || mt.startsWith("video/");
  const isAudioMedia = mt === "audio" || mt.startsWith("audio/");

  // Ícone baseado principalmente no tipo literal + extensão
  const getIconByType = (tipo: string) => {
    const tipoLower = (tipo || "").toLowerCase();

    if (isPdf) {
      return <FileText className="h-4 w-4" />;
    }

    if (tipoLower.includes("imagem") || tipoLower === "image") {
      return <Image className="h-4 w-4" />;
    }
    if (tipoLower.includes("video") || tipoLower === "vídeo") {
      return <Video className="h-4 w-4" />;
    }
    if (tipoLower.includes("áudio") || tipoLower.includes("audio")) {
      return <Music className="h-4 w-4" />;
    }
    if (tipoLower.includes("documento") || tipoLower === "document") {
      return <FileText className="h-4 w-4" />;
    }

    return <Paperclip className="h-4 w-4" />;
  };

  const handleOpenAttachment = () => {
    if (!attachmentURL) return;
    window.open(attachmentURL, "_blank");
  };

  // Quando temos o anexo real
  if (attachmentURL && mediaType) {
    return (
      <div className="mb-2 space-y-2">
        {/* Preview visual só para imagem/vídeo/áudio */}
        {isImageMedia && (
          <div className="rounded-lg overflow-hidden bg-background/20 max-w-sm">
            <img
              src={attachmentURL}
              alt={baseName}
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        )}

        {isVideoMedia && (
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

        {isAudioMedia && (
          <div className="rounded-lg bg-background/20 p-2">
            <audio src={attachmentURL} controls className="w-full">
              Seu navegador não suporta áudio.
            </audio>
          </div>
        )}

        {/* PDF e qualquer outro tipo: cartão clicável que abre o arquivo */}
        <button
          type="button"
          onClick={handleOpenAttachment}
          className="flex w-full items-center gap-2 rounded bg-background/50 p-2 text-xs hover:bg-background/70 transition-colors"
        >
          {getIconByType(anexoTipo)}
          <div className="flex-1 text-left">
            <div className="font-medium">
              {anexoTipo}{" "}
              {anexoTamanho && `• ${formatFileSize(anexoTamanho)}`}
            </div>
            <div className="text-muted-foreground truncate">
              {baseName}
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Fallback: apenas info do arquivo (pasta de anexos não carregada)
  return (
    <div className="mb-2 flex items-center gap-2 rounded bg-background/50 p-2 text-xs">
      {getIconByType(anexoTipo)}
      <div className="flex-1">
        <div className="font-medium">
          {anexoTipo}{" "}
          {anexoTamanho && `• ${formatFileSize(anexoTamanho)}`}
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
