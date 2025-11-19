// @ts-nocheck

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ConversationList } from "./whatsapp/ConversationList";
import { ChatPanel } from "./whatsapp/ChatPanel";
import { WhatsAppHeader } from "./whatsapp/WhatsAppHeader";
import { useToast } from "@/hooks/use-toast";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.4.84:3001";

interface ConversationLike {
  id: number;
  nome_contato: string;
  messageCount: number;
  source_file?: string | null;
}

interface WhatsAppViewerProps {
  onReset?: () => void;
}

export const WhatsAppViewer = ({ onReset }: WhatsAppViewerProps) => {
  const [conversations, setConversations] = useState<ConversationLike[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationLike | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const { toast } = useToast();

  // Carrega conversas direto do backend (tabela messages)
  useEffect(() => {
    const loadConversationsFromApi = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${API_BASE}/api/chats`);
        if (!res.ok) {
          throw new Error(`Erro HTTP ${res.status}`);
        }

        const data: {
          chat_name: string;
          total_mensagens: number;
          primeira_msg: string;
          ultima_msg: string;
        }[] = await res.json();

        const convos: ConversationLike[] = data.map((chat, index) => ({
          id: index + 1,
          nome_contato: chat.chat_name,
          messageCount: chat.total_mensagens,
          source_file: "", // se quiser, preenche depois
        }));

        setConversations(convos);
        setSelectedConversation(convos[0] ?? null);
      } catch (error) {
        console.error("Erro ao carregar conversas da API:", error);
        toast({
          title: "Erro ao carregar conversas",
          description:
            "Não foi possível buscar os dados do servidor local. Verifique se a API está rodando.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationsFromApi();
  }, [toast]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.nome_contato
        ?.toLowerCase()
        .includes(globalSearch.toLowerCase()) ||
      conv.source_file?.toLowerCase().includes(globalSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Carregando conversas do servidor local...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <WhatsAppHeader
        onReset={onReset}
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
      />

      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          conversations={filteredConversations as any}
          selectedConversation={selectedConversation as any}
          onSelectConversation={(c) => setSelectedConversation(c as any)}
        />

        <ChatPanel conversation={selectedConversation as any} />
      </div>
    </div>
  );
};
