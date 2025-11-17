import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WhatsAppHeaderProps {
  onReset: () => void;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
}

export const WhatsAppHeader = ({ 
  onReset, 
  globalSearch, 
  onGlobalSearchChange 
}: WhatsAppHeaderProps) => {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">
          Visualizador WhatsApp
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversas..."
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={onReset}
          title="Carregar outro arquivo"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
