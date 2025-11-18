// @ts-nocheck

import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WhatsAppHeaderProps {
  onReset?: () => void;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
}

export const WhatsAppHeader = ({
  onReset,
  globalSearch,
  onGlobalSearchChange,
}: WhatsAppHeaderProps) => {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-muted/60 px-4 py-2">
      {/* Esquerda: voltar + título */}
      <div className="flex items-center gap-3">
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex flex-col">
          <span className="text-sm font-medium">Visualizador WhatsApp</span>
          <span className="text-xs text-muted-foreground">
            Lendo diretamente da API local (SQLite no servidor).
          </span>
        </div>
      </div>

      {/* Centro: busca global */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            className="pl-8 text-sm"
            placeholder="Buscar pelo nome do contato ou arquivo..."
          />
        </div>
      </div>
    </header>
  );
};
