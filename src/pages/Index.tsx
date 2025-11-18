import { useState, useRef } from "react";
import { WhatsAppViewer } from "@/components/WhatsAppViewer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const Index = () => {
  const [dbFile, setDbFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

  const dbInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentsInputRef = useRef<HTMLInputElement | null>(null);

  const handleDbClick = () => {
    dbInputRef.current?.click();
  };

  const handleAttachmentsClick = () => {
    attachmentsInputRef.current?.click();
  };

  const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDbFile(file);
  };

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setAttachmentFiles(files);
  };

  const handleReset = () => {
    setDbFile(null);
    setAttachmentFiles([]);
  };

  const readyToOpenViewer =
    dbFile !== null && attachmentFiles.length > 0;

  // Enquanto não tiver .db + anexos, fica na tela de seleção
  if (!readyToOpenViewer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4">
        <Card className="w-full max-w-xl shadow-lg border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold">
              Visualizador de Backup do WhatsApp
            </CardTitle>
            <CardDescription className="text-sm">
              Selecione o arquivo <span className="font-semibold">.db</span> do
              iMazing <span className="font-semibold">e</span> a pasta de anexos
              para visualizar suas conversas com mídias.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            {/* Seleção do .db */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Arquivo de backup (.db)</p>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDbClick}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Escolher arquivo .db
                </Button>

                <span className="text-xs text-muted-foreground truncate">
                  {dbFile ? dbFile.name : "Nenhum arquivo selecionado"}
                </span>
              </div>

              <input
                ref={dbInputRef}
                type="file"
                accept=".db"
                onChange={handleDbChange}
                className="hidden"
              />

              <p className="text-xs text-muted-foreground mt-1">
                Obrigatório. Use o arquivo .db exportado pelo iMazing.
              </p>
            </div>

            {/* Seleção da pasta de anexos */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Pasta de anexos (obrigatória)
              </p>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAttachmentsClick}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Selecionar pasta de anexos
                </Button>

                <span className="text-xs text-muted-foreground truncate">
                  {attachmentFiles.length > 0
                    ? `${attachmentFiles.length} arquivos selecionados`
                    : "Nenhuma pasta selecionada"}
                </span>
              </div>

              <input
                ref={attachmentsInputRef}
                type="file"
                multiple
                // @ts-ignore
                webkitdirectory=""
                directory=""
                onChange={handleAttachmentsChange}
                className="hidden"
              />

              <p className="text-xs text-muted-foreground mt-1">
                Obrigatório. Aponte para a pasta onde ficam as mídias do backup
                (imagens, áudios, PDFs etc).
              </p>
            </div>

            <p className="text-xs text-muted-foreground pt-2 border-t">
              O visualizador só será aberto depois de selecionar o arquivo .db
              <span className="font-semibold"> e </span>
              a pasta de anexos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aqui já temos .db + anexos -> abre o viewer
  return (
    <WhatsAppViewer
      dbFile={dbFile as File}
      onReset={handleReset}
      initialAttachments={attachmentFiles}
    />
  );
};

export default Index;
