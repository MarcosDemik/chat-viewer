import { ArrowLeft, Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WhatsAppHeaderProps {
  onReset: () => void;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  onAttachmentsUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  attachmentsLoaded?: boolean;
}

export const WhatsAppHeader = ({
  onReset,
  globalSearch,
  onGlobalSearchChange,
  onAttachmentsUpload,
  attachmentsLoaded,
}: WhatsAppHeaderProps) => {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-muted/60 px-4 py-2">
      {/* Esquerda: voltar + título */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col">
          <span className="text-sm font-medium">Visualizador WhatsApp</span>
          <span className="text-xs text-muted-foreground">
            {attachmentsLoaded
              ? "Anexos carregados a partir da pasta selecionada."
              : "Para visualizar imagens e vídeos, carregue a pasta de anexos."}
          </span>
        </div>
      </div>

      {/* Centro: busca */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            placeholder="Buscar conversa..."
            className="pl-8 text-sm"
          />
        </div>
      </div>

      {/* Direita: botão de anexos (apenas se ainda não carregou) */}
      {onAttachmentsUpload && !attachmentsLoaded && (
        <div className="shrink-0">
          <label htmlFor="header-attachments-upload">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-2 cursor-pointer"
            >
              <div>
                <FolderOpen className="h-4 w-4" />
                <span>Carregar anexos</span>
              </div>
            </Button>
            <input
              id="header-attachments-upload"
              type="file"
              multiple
              // @ts-ignore
              webkitdirectory=""
              directory=""
              className="hidden"
              onChange={onAttachmentsUpload}
            />
          </label>
        </div>
      )}
    </header>
  );
};
