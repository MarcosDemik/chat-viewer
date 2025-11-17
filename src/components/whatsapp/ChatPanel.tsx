import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ChatMessages } from "./ChatMessages";
import { ChatSearch } from "./ChatSearch";
import type { Conversation, SQLiteProcessor } from "@/lib/sqlite-processor";

interface ChatPanelProps {
  conversation: Conversation | null;
  sqliteProcessor: SQLiteProcessor | null;
}

export const ChatPanel = ({ conversation, sqliteProcessor }: ChatPanelProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <p className="text-lg text-muted-foreground">
            Selecione uma conversa para visualizar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <h2 className="font-semibold text-foreground">
            {conversation.nome_contato}
          </h2>
          <p className="text-sm text-muted-foreground">
            {conversation.messageCount} mensagens
          </p>
        </div>

        <ChatSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchResults={searchResults}
          currentSearchIndex={currentSearchIndex}
          onNavigate={(direction) => {
            if (direction === 'next') {
              setCurrentSearchIndex((prev) => 
                prev < searchResults.length - 1 ? prev + 1 : prev
              );
            } else {
              setCurrentSearchIndex((prev) => 
                prev > 0 ? prev - 1 : prev
              );
            }
          }}
        />
      </div>

      {/* Messages */}
      <ChatMessages
        conversation={conversation}
        sqliteProcessor={sqliteProcessor}
        searchTerm={searchTerm}
        onSearchResultsChange={setSearchResults}
        highlightedMessageId={searchResults[currentSearchIndex]}
      />
    </div>
  );
};
