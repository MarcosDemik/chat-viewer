/**
 * AttachmentManager - Gerencia anexos carregados pelo usuário
 *
 * Agora ele indexa:
 *  - pelo nome base completo (sem extensão)
 *  - e também por ID (UUID) que estiver dentro do nome
 *
 * Exemplo de arquivo:
 *  "2025-10-29 18 17 33 - Joseane Ônix - Produtos para Harmonizaçã - 72a52c56-5494-40a4-9d26-35acf057c8a2.jpg"
 *
 * No banco:
 *  anexo_id_arquivo = "72a52c56-5494-40a4-9d26-35acf057c8a2"
 *
 * Quando o app pedir pelo ID, ele encontra o arquivo acima.
 */
export class AttachmentManager {
  // nome base completo (sem extensão) -> File
  private attachmentMap: Map<string, File> = new Map();
  // id (uuid) extraído do nome -> File
  private idMap: Map<string, File> = new Map();

  /**
   * Indexa arquivos da pasta anexos/
   */
  async loadAttachments(files: FileList | File[]) {
    console.log(`Indexando ${files.length} arquivos de anexo...`);

    for (const file of Array.from(files)) {
      const fileName = file.name;
      const baseName = this.getBaseName(fileName).toLowerCase();

      // 1) indexa pelo nome base completo
      this.attachmentMap.set(baseName, file);

      // 2) tenta extrair um UUID do nome e indexar também por ele
      const uuid = this.extractUuid(baseName);
      if (uuid) {
        this.idMap.set(uuid, file);
        console.log(`Indexado UUID: ${uuid} -> ${fileName}`);
      } else {
        console.log(`Indexado baseName: ${baseName} -> ${fileName}`);
      }
    }

    console.log(
      `Total de ${this.attachmentMap.size} nomes base e ${this.idMap.size} UUIDs indexados`
    );
  }

  /**
   * Busca anexo:
   *  - se receber só o ID (ex: "72a5..."), procura em idMap
   *  - senão tenta pelo nome base completo
   */
  getAttachment(fileNameOrId: string): File | null {
    if (!fileNameOrId) return null;

    const baseName = this.getBaseName(fileNameOrId).toLowerCase();

    // 1) tenta direto pelo nome base (caso o banco traga nome completo)
    let file = this.attachmentMap.get(baseName);
    if (file) {
      console.log(`Anexo encontrado por baseName: ${baseName} -> ${file.name}`);
      return file;
    }

    // 2) tenta tratar o parâmetro como UUID (caso o banco traga só o ID)
    const uuid = this.extractUuid(baseName);
    if (uuid) {
      file = this.idMap.get(uuid) || null;
      if (file) {
        console.log(`Anexo encontrado por UUID: ${uuid} -> ${file.name}`);
        return file;
      }
    }

    console.log(
      `Anexo NÃO encontrado: "${fileNameOrId}" (baseName: "${baseName}", uuid: "${uuid || "nenhum"}")`
    );
    return null;
  }

  /**
   * Cria URL para exibir anexo
   */
  getAttachmentURL(fileNameOrId: string): string | null {
    const file = this.getAttachment(fileNameOrId);
    if (!file) return null;
    return URL.createObjectURL(file);
  }

  /**
   * Detecta tipo de mídia pelo MIME type do arquivo real
   */
  getMediaType(
    fileNameOrId: string
  ): "image" | "video" | "audio" | "document" | "unknown" {
    const file = this.getAttachment(fileNameOrId);
    if (!file) return "unknown";

    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.includes("pdf") || mimeType.includes("document"))
      return "document";

    return "unknown";
  }

  /**
   * Extrai nome base sem extensão
   * Exemplo: "arquivo.webm" -> "arquivo"
   */
  private getBaseName(fileName: string): string {
    const lastDot = fileName.lastIndexOf(".");
    if (lastDot === -1) return fileName;
    return fileName.substring(0, lastDot);
  }

  /**
   * Tenta extrair um UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) de uma string
   */
  private extractUuid(text: string): string | null {
    const match = text.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    return match ? match[0].toLowerCase() : null;
  }

  hasAttachments(): boolean {
    return this.attachmentMap.size > 0 || this.idMap.size > 0;
  }

  getCount(): number {
    // não é perfeito, mas bom para debug
    return Math.max(this.attachmentMap.size, this.idMap.size);
  }

  getIndexedNames(): string[] {
    return Array.from(this.attachmentMap.keys());
  }

  clear() {
    this.attachmentMap.clear();
    this.idMap.clear();
    console.log("Anexos limpos da memória");
  }
}
