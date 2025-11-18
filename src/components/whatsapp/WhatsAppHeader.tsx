import type React from "react";
import { ArrowLeft, Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WhatsAppHeaderProps {
  onReset: () => void;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  onAttachmentsUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  attachmentsLoaded: boolean;
}

export const WhatsAppHeader = ({
  onReset,
  globalSearch,
  onGlobalSearchChange,
  onAttachmentsUpload,
  attachmentsLoaded,
}: WhatsAppHeaderProps) => {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Esquerda: voltar + título */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onReset}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight">
              Visualizador WhatsApp
            </span>

            {/* Aviso "carregar anexos" some depois que anexos forem carregados */}
            {!attachmentsLoaded && (
              <span className="text-xs text-muted-foreground">
                Para visualizar imagens e vídeos, carregue a pasta de anexos
              </span>
            )}
          </div>
        </div>

        {/* Direita: busca global + botão de anexos */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar conversa..."
              value={globalSearch}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          {/* Botão de carregar anexos à direita do título, sempre visível */}
          <label htmlFor="attachments-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span>Carregar anexos</span>
            </Button>
            <input
              id="attachments-upload"
              type="file"
              multiple
              // @ts-ignore webkitdirectory não está no tipo
              webkitdirectory=""
              directory=""
              className="hidden"
              onChange={onAttachmentsUpload}
            />
          </label>
        </div>
      </div>
    </header>
  );
};
