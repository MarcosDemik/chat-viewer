import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ConversationList } from "./whatsapp/ConversationList";
import { ChatPanel } from "./whatsapp/ChatPanel";
import { WhatsAppHeader } from "./whatsapp/WhatsAppHeader";
import { useToast } from "@/hooks/use-toast";
import { SQLiteProcessor, type Conversation } from "@/lib/sqlite-processor";
import { AttachmentManager } from "@/lib/attachment-manager";

interface WhatsAppViewerProps {
  dbFile: File;
  onReset: () => void;
}

export const WhatsAppViewer = ({ dbFile, onReset }: WhatsAppViewerProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [sqliteProcessor, setSqliteProcessor] = useState<SQLiteProcessor | null>(null);
  const [attachmentManager] = useState(() => new AttachmentManager());
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();

    // cleanup
    return () => {
      if (sqliteProcessor) {
        sqliteProcessor.close();
      }
      attachmentManager.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbFile]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);

      const processor = await SQLiteProcessor.fromFile(dbFile);
      setSqliteProcessor(processor);

      const convos = processor.listConversations();
      setConversations(convos);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
      toast({
        title: "Erro ao carregar backup",
        description: "Não foi possível processar o arquivo de backup. Verifique se é um arquivo .db válido.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.nome_contato.toLowerCase().includes(globalSearch.toLowerCase()) ||
    conv.source_file.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const handleAttachmentsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      await attachmentManager.loadAttachments(files);
      setAttachmentsLoaded(true);

      toast({
        title: "Anexos carregados",
        description: `${attachmentManager.getCount()} arquivos de anexo indexados com sucesso`,
      });
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
      toast({
        title: "Erro ao carregar anexos",
        description: "Não foi possível carregar os arquivos de anexo",
        variant: "destructive",
      });
    }
  };

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
        onAttachmentsUpload={handleAttachmentsUpload}
        attachmentsLoaded={attachmentsLoaded}
      />

      {/* Sem barras extras de aviso: só o header e o layout principal */}
      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          conversations={filteredConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />

        <ChatPanel
          conversation={selectedConversation}
          sqliteProcessor={sqliteProcessor}
          attachmentManager={attachmentManager}
        />
      </div>
    </div>
  );
};
