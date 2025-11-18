import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useToast } from "@/hooks/use-toast";
import type {
  Conversation,
  SQLiteProcessor,
  Message,
} from "@/lib/sqlite-processor";
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
  const [hasMore, setHasMore] = useState(false); // se ainda tem mensagens MAIS ANTIGAS
  const [currentOffset, setCurrentOffset] = useState(0); // de onde começa o lote atual
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  // Sempre que trocar de conversa ou de DB, reseta e carrega o último lote
  useEffect(() => {
    if (!conversation || !sqliteProcessor) return;

    setMessages([]);
    setHasMore(false);
    setCurrentOffset(0);
    messageRefs.current = {};
    loadInitialMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, sqliteProcessor]);

  // Busca dentro da conversa (no DB inteiro, não só nas mensagens carregadas)
  useEffect(() => {
    if (searchTerm && sqliteProcessor) {
      performSearch();
    } else {
      onSearchResultsChange([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sqliteProcessor]);

  // Scroll até a mensagem destacada (resultado da busca)
  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedMessageId]);

  const loadInitialMessages = async () => {
    if (!sqliteProcessor || !conversation) return;

    try {
      setIsLoading(true);

      const total = conversation.messageCount ?? 0;

      // queremos começar SEMPRE pelos ÚLTIMOS 400
      const initialOffset =
        total > MESSAGES_PER_BATCH ? total - MESSAGES_PER_BATCH : 0;

      const { messages: loadedMessages } = sqliteProcessor.getMessages(
        conversation.id,
        MESSAGES_PER_BATCH,
        initialOffset
      );

      setMessages(loadedMessages);
      setCurrentOffset(initialOffset);
      setHasMore(initialOffset > 0); // se offset > 0, ainda tem coisa mais antiga
      setIsLoading(false);

      // joga o scroll pro final (última mensagem)
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 0);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
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
      const messageIds = sqliteProcessor.searchMessages(
        conversation.id,
        searchTerm
      );
      onSearchResultsChange(messageIds);
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  // Carrega mensagens MAIS ANTIGAS quando sobe o scroll
  const loadMoreMessages = () => {
    if (!sqliteProcessor) return;
    if (!hasMore || currentOffset <= 0) return;

    try {
      const newOffset = Math.max(0, currentOffset - MESSAGES_PER_BATCH);
      const limit = currentOffset - newOffset || MESSAGES_PER_BATCH;

      const el = scrollRef.current;
      const prevHeight = el ? el.scrollHeight : 0;

      const { messages: olderMessages } = sqliteProcessor.getMessages(
        conversation.id,
        limit,
        newOffset
      );

      // essas são mais antigas -> entram ANTES das que já estão
      setMessages((prev) => [...olderMessages, ...prev]);
      setCurrentOffset(newOffset);
      setHasMore(newOffset > 0);

      // mantém o ponto que o usuário estava vendo
      setTimeout(() => {
        if (!el) return;
        const newHeight = el.scrollHeight;
        el.scrollTop += newHeight - prevHeight;
      }, 0);
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;

    // Chegou perto do TOPO -> busca lote mais antigo
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
    <div
      className="flex-1 px-4 py-6 overflow-y-auto"
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
    </div>
  );
};
