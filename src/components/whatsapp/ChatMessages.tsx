import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { useToast } from "@/hooks/use-toast";
import type { Conversation, SQLiteProcessor, Message } from "@/lib/sqlite-processor";
import type { AttachmentManager } from "@/lib/attachment-manager";

interface ChatMessagesProps {
  conversation: Conversation;
  sqliteProcessor: SQLiteProcessor | null;
  attachmentManager: AttachmentManager | null;
  searchTerm: string;
  onSearchResultsChange: (results: number[]) => void;
  highlightedMessageId?: number;
}

const MESSAGES_PER_BATCH = 400;

export const ChatMessages = ({
  conversation,
  sqliteProcessor,
  attachmentManager,
  searchTerm,
  onSearchResultsChange,
  highlightedMessageId,
}: ChatMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  useEffect(() => {
    loadInitialMessages();
  }, [conversation, sqliteProcessor]);

  useEffect(() => {
    if (searchTerm && sqliteProcessor) {
      performSearch();
    } else {
      onSearchResultsChange([]);
    }
  }, [searchTerm, sqliteProcessor]);

  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedMessageId]);

  const loadInitialMessages = async () => {
    if (!sqliteProcessor) return;
    
    try {
      setIsLoading(true);
      
      const { messages: loadedMessages, hasMore: more } = sqliteProcessor.getMessages(
        conversation.id,
        MESSAGES_PER_BATCH,
        0
      );

      setMessages(loadedMessages);
      setHasMore(more);
      setIsLoading(false);

      // Scroll to bottom after loading
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens desta conversa",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const performSearch = () => {
    if (!sqliteProcessor || !searchTerm) return;
    
    try {
      const messageIds = sqliteProcessor.searchMessages(conversation.id, searchTerm);
      onSearchResultsChange(messageIds);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const loadMoreMessages = () => {
    if (!hasMore || isLoading || !sqliteProcessor) return;

    try {
      const { messages: loadedMessages, hasMore: more } = sqliteProcessor.getMessages(
        conversation.id,
        MESSAGES_PER_BATCH,
        messages.length
      );

      setMessages((prev) => [...loadedMessages, ...prev]);
      setHasMore(more);
    } catch (error) {
      console.error('Erro ao carregar mais mensagens:', error);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    
    // Load more when scrolling near the top
    if (element.scrollTop < 200 && hasMore && !isLoading) {
      loadMoreMessages();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea 
      className="flex-1 px-4 py-6"
      ref={scrollRef}
      onScroll={handleScroll}
    >
      <div className="space-y-2 max-w-4xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            ref={(el) => {
              if (el) messageRefs.current[message.id] = el;
            }}
          >
            <MessageBubble
              message={message}
              attachmentManager={attachmentManager}
              isHighlighted={highlightedMessageId === message.id}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
