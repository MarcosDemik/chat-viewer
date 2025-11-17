import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "../WhatsAppViewer";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) => {
  return (
    <aside className="w-80 border-r border-border bg-sidebar">
      <div className="border-b border-sidebar-border p-4">
        <h2 className="font-semibold text-sidebar-foreground">
          Conversas ({conversations.length})
        </h2>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="divide-y divide-sidebar-border">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={cn(
                "w-full p-4 text-left transition-colors hover:bg-sidebar-accent",
                selectedConversation?.id === conversation.id && "bg-sidebar-accent"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate font-medium text-sidebar-foreground">
                    {conversation.nome_contato}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {conversation.messageCount} mensagens
                  </p>
                  {conversation.source_file && (
                    <p className="truncate text-xs text-muted-foreground">
                      {conversation.source_file}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};
