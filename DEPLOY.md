# Guia de Deploy - Visualizador de Backup WhatsApp

## ⚠️ Importante: Arquivos de Anexo

Este app **processa anexos localmente no navegador**. Para fazer deploy e usar o sistema:

### Opção 1: Upload Local (Recomendado)
**Esta é a forma que já está implementada e funcionando:**

1. Faça deploy normalmente clicando em **Publish** no Lovable
2. Quando abrir o app:
   - Faça upload do arquivo `.db`
   - Clique em "Carregar Anexos" 
   - Selecione toda a pasta `anexos/` do seu computador
3. O app indexará automaticamente todos os arquivos **apenas pelo nome base**
   - Exemplo: `foto.webm` no banco encontrará `foto.png` nos arquivos
   - A extensão é ignorada completamente na busca

**Vantagens:**
- ✅ Funciona imediatamente após deploy
- ✅ Não precisa hospedar anexos em servidor
- ✅ Máxima privacidade (dados não saem do navegador)
- ✅ Suporta backups grandes

### Opção 2: Anexos no Servidor (Para deploy permanente)

Se você quiser que os anexos já estejam disponíveis sem upload:

1. **Preparar anexos:**
   ```bash
   # Copie todos os arquivos de anexo para a pasta public
   mkdir -p public/anexos
   cp -r /caminho/para/seus/anexos/* public/anexos/
   ```

2. **Modificar o código** para buscar anexos via HTTP:
   - Editar `src/lib/attachment-manager.ts`
   - Trocar `File` objects por URLs: `public/anexos/{nome}`
   - Implementar busca por nome base via fetch

3. **Deploy:**
   - Clique em **Publish** no Lovable
   - Anexos serão servidos automaticamente

**Desvantagens:**
- ⚠️ Anexos ficam públicos na internet
- ⚠️ Aumenta tamanho do deploy (se muitos arquivos)
- ⚠️ Menos privado que processamento local

## 🚀 Como Fazer Deploy

### Passo 1: Publicar no Lovable
1. Clique em **Publish** no canto superior direito
2. Escolha um subdomínio (ex: `meu-whatsapp-viewer.lovable.app`)
3. Clique em **Update** para publicar

### Passo 2: Usar o App
1. Acesse sua URL publicada
2. Faça upload do arquivo `.db`
3. (Opcional) Clique em "Carregar Anexos" e selecione a pasta

### Passo 3: Domínio Customizado (Opcional)
1. Vá em **Settings → Domains**
2. Conecte seu domínio próprio
3. Configure DNS conforme instruções

## 🔒 Segurança e Privacidade

**Processamento 100% Local:**
- ✅ O arquivo `.db` nunca é enviado para servidor
- ✅ Anexos são processados apenas no navegador
- ✅ Nada é armazenado ou transmitido
- ✅ Dados permanecem privados no seu computador

## 📊 Performance

O app foi otimizado para backups grandes:
- Carregamento em lotes de 400 mensagens
- Scroll infinito para carregar mais
- Indexação eficiente de anexos
- Busca rápida por nome base (ignora extensão)

## 🛠️ Troubleshooting

### Anexo não aparece
- ✅ Verifique se carregou a pasta de anexos
- ✅ Confirme que o arquivo existe na pasta
- ✅ Nome deve corresponder (extensão é ignorada)
- ✅ Veja console do navegador para logs de busca

### App lento com backup grande
- ✅ Use Chrome/Edge (melhor performance)
- ✅ Feche outras abas para liberar memória
- ✅ Aguarde indexação completa dos anexos

### Busca não encontra mensagens
- ✅ Busca é case-insensitive
- ✅ Procura apenas em `texto_mensagem`
- ✅ Ignore acentuação se necessário

## 📝 Notas Técnicas

**Busca de Anexos:**
```typescript
// CRÍTICO: Busca APENAS por nome base
// "arquivo.webm" encontra "arquivo.png"
const baseName = fileName.split('.').slice(0, -1).join('.');
```

**Tipos de Anexo:**
- O campo `anexo_tipo` é usado LITERALMENTE do banco
- Nunca deduzimos tipo pela extensão
- Regra: sempre confie no valor do campo `anexo_tipo`

## 🎯 Próximos Passos

Após deploy, você pode:
1. **Exportar conversas** em PDF/TXT
2. **Adicionar filtros** por data/tipo
3. **Criar estatísticas** de uso
4. **Galeria de mídia** agrupada
5. **Modo escuro** alternável
