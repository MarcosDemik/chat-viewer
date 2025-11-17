import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppViewer } from "@/components/WhatsAppViewer";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [dbFile, setDbFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.db')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo .db válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDbFile(file);
    setIsLoading(false);

    toast({
      title: "Arquivo carregado",
      description: "Backup do WhatsApp carregado com sucesso",
    });
  };

  if (!dbFile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Visualizador de Backup WhatsApp
            </h1>
            <p className="text-muted-foreground">
              Carregue seu arquivo de backup (.db) do iMazing para visualizar suas conversas
            </p>
          </div>

          <label htmlFor="file-upload">
            <Button
              variant="default"
              size="lg"
              className="cursor-pointer"
              disabled={isLoading}
              asChild
            >
              <div>
                <Upload className="mr-2 h-5 w-5" />
                {isLoading ? "Carregando..." : "Selecionar arquivo .db"}
              </div>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".db"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </label>
        </div>
      </div>
    );
  }

  return <WhatsAppViewer dbFile={dbFile} onReset={() => setDbFile(null)} />;
};

export default Index;
