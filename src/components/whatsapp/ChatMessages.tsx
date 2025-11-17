import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Conversation } from "../WhatsAppViewer";

export interface Message {
  id: number;
  nome_contato: string;
  data_hora_envio: string;
  tipo_mensagem: string;
  nome_remetente_grupo: string | null;
  status_mensagem: string | null;
  texto_mensagem: string | null;
  anexo_tipo: string | null;
  anexo_tamanho: string | null;
  anexo_id_arquivo: string | null;
}

interface ChatMessagesProps {
  conversation: Conversation;
  dbFile: File;
  searchTerm: string;
  onSearchResultsChange: (results: number[]) => void;
  highlightedMessageId?: number;
}

const MESSAGES_PER_BATCH = 400;

export const ChatMessages = ({
  conversation,
  dbFile,
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
  }, [conversation]);

  useEffect(() => {
    if (searchTerm && messages.length > 0) {
      performSearch();
    } else {
      onSearchResultsChange([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightedMessageId]);

  const loadInitialMessages = async () => {
    try {
      setIsLoading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke('whatsapp-backup', {
          body: {
            action: 'get_messages',
            dbFile: base64Data.split(',')[1],
            conversationId: conversation.id,
            limit: MESSAGES_PER_BATCH,
            offset: 0,
          },
        });

        if (error) throw error;

        setMessages(data.messages || []);
        setHasMore(data.hasMore || false);
        setIsLoading(false);

        // Scroll to bottom after loading
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      };

      reader.readAsDataURL(dbFile);
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

  const performSearch = async () => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke('whatsapp-backup', {
          body: {
            action: 'search_messages',
            dbFile: base64Data.split(',')[1],
            conversationId: conversation.id,
            searchTerm,
          },
        });

        if (error) throw error;

        onSearchResultsChange(data.messageIds || []);
      };

      reader.readAsDataURL(dbFile);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || isLoading) return;

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke('whatsapp-backup', {
          body: {
            action: 'get_messages',
            dbFile: base64Data.split(',')[1],
            conversationId: conversation.id,
            limit: MESSAGES_PER_BATCH,
            offset: messages.length,
          },
        });

        if (error) throw error;

        setMessages((prev) => [...data.messages, ...prev]);
        setHasMore(data.hasMore || false);
      };

      reader.readAsDataURL(dbFile);
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
              isHighlighted={highlightedMessageId === message.id}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
