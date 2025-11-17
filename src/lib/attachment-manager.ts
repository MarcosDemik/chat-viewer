/**
 * AttachmentManager - Gerencia anexos carregados pelo usuário
 * 
 * CRÍTICO: Busca arquivos APENAS pelo nome base, ignorando extensão
 * Exemplo: "arquivo.webm" no banco encontra "arquivo.png" nos anexos
 */
export class AttachmentManager {
  private attachmentMap: Map<string, File> = new Map();

  /**
   * Indexa arquivos da pasta anexos/ por nome base (sem extensão)
   */
  async loadAttachments(files: FileList | File[]) {
    console.log(`Indexando ${files.length} arquivos de anexo...`);
    
    for (const file of Array.from(files)) {
      // Extrair nome base sem extensão
      const fileName = file.name;
      const baseName = this.getBaseName(fileName);
      
      // Indexar por nome base (sem extensão)
      this.attachmentMap.set(baseName.toLowerCase(), file);
      
      console.log(`Indexado: ${baseName} -> ${fileName}`);
    }
    
    console.log(`Total de ${this.attachmentMap.size} anexos indexados`);
  }

  /**
   * Busca anexo APENAS pelo nome base, ignorando extensão
   * 
   * CRÍTICO: Remove extensão antes de buscar
   */
  getAttachment(fileNameWithExt: string): File | null {
    const baseName = this.getBaseName(fileNameWithExt);
    const file = this.attachmentMap.get(baseName.toLowerCase());
    
    if (file) {
      console.log(`Anexo encontrado: ${fileNameWithExt} -> ${file.name}`);
    } else {
      console.log(`Anexo NÃO encontrado: ${fileNameWithExt} (buscando por: ${baseName})`);
    }
    
    return file || null;
  }

  /**
   * Cria URL para exibir anexo
   */
  getAttachmentURL(fileNameWithExt: string): string | null {
    const file = this.getAttachment(fileNameWithExt);
    if (!file) return null;
    
    return URL.createObjectURL(file);
  }

  /**
   * Extrai nome base sem extensão
   * Exemplo: "arquivo.webm" -> "arquivo"
   */
  private getBaseName(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1) return fileName;
    return fileName.substring(0, lastDot);
  }

  /**
   * Verifica se tem anexos carregados
   */
  hasAttachments(): boolean {
    return this.attachmentMap.size > 0;
  }

  /**
   * Retorna quantidade de anexos
   */
  getCount(): number {
    return this.attachmentMap.size;
  }

  /**
   * Lista todos os nomes base indexados
   */
  getIndexedNames(): string[] {
    return Array.from(this.attachmentMap.keys());
  }

  /**
   * Limpa todos os anexos
   */
  clear() {
    // Revoke all object URLs to prevent memory leaks
    for (const file of this.attachmentMap.values()) {
      // Note: We can't revoke URLs created elsewhere, but we clean the map
    }
    this.attachmentMap.clear();
    console.log('Anexos limpos da memória');
  }

  /**
   * Detecta tipo de mídia pelo MIME type do arquivo real
   */
  getMediaType(fileNameWithExt: string): 'image' | 'video' | 'audio' | 'document' | 'unknown' {
    const file = this.getAttachment(fileNameWithExt);
    if (!file) return 'unknown';

    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    
    return 'unknown';
  }
}
