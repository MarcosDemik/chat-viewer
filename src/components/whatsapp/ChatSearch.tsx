import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchResults: number[];
  currentSearchIndex: number;
  onNavigate: (direction: 'next' | 'prev') => void;
}

export const ChatSearch = ({
  searchTerm,
  onSearchChange,
  searchResults,
  currentSearchIndex,
  onNavigate,
}: ChatSearchProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar nesta conversa..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {searchResults.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {currentSearchIndex + 1} de {searchResults.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('prev')}
            disabled={currentSearchIndex === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('next')}
            disabled={currentSearchIndex === searchResults.length - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
