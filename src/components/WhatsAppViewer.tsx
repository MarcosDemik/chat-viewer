import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ConversationList } from "./whatsapp/ConversationList";
import { ChatPanel } from "./whatsapp/ChatPanel";
import { WhatsAppHeader } from "./whatsapp/WhatsAppHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  nome_contato: string;
  source_file: string;
  messageCount: number;
}

interface WhatsAppViewerProps {
  dbFile: File;
  onReset: () => void;
}

export const WhatsAppViewer = ({ dbFile, onReset }: WhatsAppViewerProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, [dbFile]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      
      // Convert file to base64 for transmission
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        // Call edge function to process SQLite file
        const { data, error } = await supabase.functions.invoke('whatsapp-backup', {
          body: { 
            action: 'list_conversations',
            dbFile: base64Data.split(',')[1] // Remove data:application/octet-stream;base64, prefix
          },
        });

        if (error) throw error;
        
        setConversations(data.conversations || []);
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        throw new Error("Erro ao ler arquivo");
      };
      
      reader.readAsDataURL(dbFile);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar backup",
        description: "Não foi possível processar o arquivo de backup",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.nome_contato.toLowerCase().includes(globalSearch.toLowerCase()) ||
    conv.source_file.toLowerCase().includes(globalSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Processando backup do WhatsApp...</p>
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
          conversations={filteredConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />
        
        <ChatPanel
          conversation={selectedConversation}
          dbFile={dbFile}
        />
      </div>
    </div>
  );
};
