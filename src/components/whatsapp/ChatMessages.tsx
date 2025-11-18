// @ts-nocheck

import { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useToast } from "@/hooks/use-toast";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.4.84:3001";

interface ChatMessagesProps {
  conversation: any; // mantém compat com o resto do app
  searchTerm: string;
  onSearchResultsChange: (results: number[]) => void;
  highlightedMessageId?: number;
}

const MESSAGES_PER_BATCH = 400;

export const ChatMessages = ({
  conversation,
  searchTerm,
  onSearchResultsChange,
  highlightedMessageId,
}: ChatMessagesProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false); // se ainda tem mensagens MAIS ANTIGAS
  const [currentOffset, setCurrentOffset] = useState(0); // de onde começa o lote atual
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Sempre que trocar de conversa, reseta e carrega o último lote (API)
  useEffect(() => {
    if (!conversation || !conversation.nome_contato) return;

    setMessages([]);
    setHasMore(false);
    setCurrentOffset(0);
    messageRefs.current = {};
    loadInitialMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.nome_contato]);

  // Busca dentro da conversa (agora nos messages já carregados em memória)
  useEffect(() => {
    if (searchTerm) {
      try {
        const term = searchTerm.toLowerCase();
        const ids = messages
          .filter((m) => (m.texto_mensagem || "").toLowerCase().includes(term))
          .map((m) => m.id);
        onSearchResultsChange(ids);
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
      }
    } else {
      onSearchResultsChange([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, messages]);

  // Scroll até a mensagem destacada (resultado da busca)
  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      messageRefs.current[highlightedMessageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedMessageId]);

  // ---------- FUNÇÕES USANDO API EM VEZ DE sqliteProcessor ----------

  const fetchMessagesFromApi = async (
    nomeContato: string,
    limit: number,
    offset: number
  ) => {
    const params = new URLSearchParams({
      nome: nomeContato,
      limit: String(limit),
      offset: String(offset),
    });

    const res = await fetch(`${API_BASE}/api/messages?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    return (data || []) as any[];
  };

  const loadInitialMessages = async () => {
    if (!conversation || !conversation.nome_contato) return;

    try {
      setIsLoading(true);

      const total = conversation.messageCount ?? 0;

      // queremos começar SEMPRE pelos ÚLTIMOS 400
      const initialOffset =
        total > MESSAGES_PER_BATCH ? total - MESSAGES_PER_BATCH : 0;

      const loadedMessages = await fetchMessagesFromApi(
        conversation.nome_contato,
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

  // Carrega mensagens MAIS ANTIGAS quando sobe o scroll (também via API)
  const loadMoreMessages = async () => {
    if (!conversation || !conversation.nome_contato) return;
    if (!hasMore || currentOffset <= 0) return;

    try {
      const newOffset = Math.max(0, currentOffset - MESSAGES_PER_BATCH);
      const limit = currentOffset - newOffset || MESSAGES_PER_BATCH;

      const el = scrollRef.current;
      const prevHeight = el ? el.scrollHeight : 0;

      const olderMessages = await fetchMessagesFromApi(
        conversation.nome_contato,
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

  // ---------- VISUAL ORIGINAL (arquivo 1) MANTIDO ----------

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
              isHighlighted={highlightedMessageId === message.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
