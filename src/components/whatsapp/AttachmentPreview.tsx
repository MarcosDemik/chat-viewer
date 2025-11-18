// @ts-nocheck

import { useState, useRef } from "react";
import { Paperclip, Image, Video, Music, FileText, X } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.4.87:3001";

interface AttachmentPreviewProps {
  anexoIdArquivo: string;
  anexoTipo: string;
  anexoTamanho: string | null;
}

export const AttachmentPreview = ({
  anexoIdArquivo,
  anexoTipo,
  anexoTamanho,
}: AttachmentPreviewProps) => {
  if (!anexoIdArquivo) return null;

  const [showImageModal, setShowImageModal] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const url = `${API_BASE}/api/attachments/${encodeURIComponent(
    anexoIdArquivo
  )}`;

  const handleClick = () => {
    window.open(url, "_blank");
  };

  const baseName = anexoIdArquivo.split(/[\\/]/).pop() ?? anexoIdArquivo;
  const ext = baseName.split(".").pop()?.toLowerCase() ?? "";
  const tipoLower = (anexoTipo || "").toLowerCase();

  const isImage =
    tipoLower === "image" ||
    tipoLower.includes("imagem") ||
    ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

  const isVideo =
    tipoLower === "video" ||
    tipoLower.includes("vídeo") ||
    ["mp4", "mov", "mkv", "webm"].includes(ext);

  const isAudio =
    tipoLower.includes("audio") ||
    tipoLower.includes("áudio") ||
    ["mp3", "wav", "ogg", "m4a", "opus"].includes(ext);

  const icon =
    tipoLower.includes("imagem") || tipoLower === "image" ? (
      <Image className="h-4 w-4" />
    ) : tipoLower.includes("video") || tipoLower.includes("vídeo") ? (
      <Video className="h-4 w-4" />
    ) : tipoLower.includes("audio") || tipoLower.includes("áudio") ? (
      <Music className="h-4 w-4" />
    ) : (
      <FileText className="h-4 w-4" />
    );

  const openImageModal = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setShowImageModal(true);
  };

  // zoom com scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => {
      const next = prev + delta;
      return Math.min(5, Math.max(0.5, next));
    });
  };

  // pan com mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPanning(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    e.preventDefault();
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setTranslate((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const endPan = () => {
    setIsPanning(false);
  };

  return (
    <>
      <div className="mt-2 space-y-2">
        {/* PREVIEW AUTOMÁTICO – só para imagem */}
        {isImage && (
          <div className="rounded-lg overflow-hidden bg-muted/40 max-w-sm">
            <img
              src={url}
              alt={baseName}
              className="w-full h-auto max-h-64 object-contain cursor-zoom-in"
              onClick={openImageModal}
              draggable={false}
            />
          </div>
        )}

        {/* Player inline para ÁUDIO, só baixa quando der play */}
        {isAudio && (
          <div className="rounded-lg bg-muted/40 p-2 max-w-sm">
            <audio src={url} controls preload="none" className="w-full">
              Seu navegador não suporta áudio.
            </audio>
          </div>
        )}

        {/* Preview de vídeo (mantido) */}
        {isVideo && (
          <div className="rounded-lg overflow-hidden bg-muted/40 max-w-sm">
            <video
              src={url}
              controls
              preload="none"
              className="w-full h-auto max-h-64"
            >
              Seu navegador não suporta vídeo.
            </video>
          </div>
        )}

        {/* CARD de anexo – mesmo visual de antes */}
        <div
          className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1 text-xs cursor-pointer hover:bg-muted/70"
          onClick={handleClick}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded bg-background border">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              <span>Anexo</span>
              {anexoTamanho && `• ${formatFileSize(anexoTamanho)}`}
            </div>
            <div className="text-muted-foreground truncate">
              {anexoIdArquivo}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL de imagem com zoom/pan e cursor de mover em tudo */}
      {showImageModal && isImage && (
        <div className="fixed inset-0 z-50 bg-black/70 cursor-move">
          {/* botão fechar – total esquerda superior, também com cursor de mover */}
          <button
            className="absolute top-0 left-0 m-4 rounded-full bg-black/70 text-white p-2 hover:bg-black/90 cursor-move"
            onClick={() => setShowImageModal(false)}
          >
            <X className="h-5 w-5" />
          </button>

          {/* área da imagem com zoom/pan */}
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endPan}
            onMouseLeave={endPan}
          >
            <div
              className="cursor-move"
              style={{
                transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
                transition: isPanning ? "none" : "transform 0.05s linear",
              }}
            >
              <img
                src={url}
                alt={baseName}
                className="max-w-[90vw] max-h-[90vh] object-contain select-none"
                draggable={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function formatFileSize(sizeStr: string | null): string {
  if (!sizeStr) return "";
  const size = Number(sizeStr);
  if (Number.isNaN(size) || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
