# Visualizador de Backup WhatsApp

Visualize seus backups do WhatsApp (iMazing) em um formato bonito e organizado, similar ao WhatsApp Web.

## 🚀 Recursos

- ✅ **Interface WhatsApp Web** - Design familiar e intuitivo
- ✅ **100% Local** - Processa tudo no navegador (máxima privacidade)
- ✅ **Busca Inteligente** - Busca global e dentro de conversas
- ✅ **Anexos Visuais** - Imagens, vídeos, áudios com preview
- ✅ **Performance** - Otimizado para backups grandes (70x+)
- ✅ **Busca Flexível de Anexos** - Encontra arquivos por nome base, ignora extensão

## 📦 Como Usar

### 1. Fazer Upload do Backup
1. Abra o app
2. Clique em "Selecionar arquivo .db"
3. Escolha seu arquivo de backup do iMazing

### 2. Carregar Anexos (Opcional)
1. Clique em "Carregar Anexos"
2. Selecione a pasta `anexos/` do seu backup
3. Aguarde indexação (busca por nome base, ignora extensão)

### 3. Visualizar Conversas
- Clique em uma conversa na sidebar
- Navegue pelas mensagens
- Use a busca para encontrar mensagens específicas
- Imagens/vídeos aparecem automaticamente se anexos foram carregados

## 🔍 Busca de Anexos

**IMPORTANTE:** O sistema busca anexos **apenas pelo nome base**, ignorando a extensão:

```
Exemplo:
- Banco de dados: "foto.webm"
- Arquivo real: "foto.png"
- Resultado: ✅ ENCONTRADO
```

Isso resolve o problema de extensões incorretas no banco de dados.

## 🚢 Deploy

### Opção 1: Lovable (Recomendado)
1. Clique em **Publish** no canto superior direito
2. Escolha um subdomínio
3. Pronto! Acesse sua URL

### Opção 2: Domínio Próprio
1. Vá em Settings → Domains
2. Conecte seu domínio
3. Configure DNS

**Veja [DEPLOY.md](DEPLOY.md) para instruções completas**

## 🔒 Privacidade

- ✅ Nada é enviado para servidor
- ✅ Processamento 100% local no navegador
- ✅ Anexos ficam apenas na sua máquina
- ✅ Código open-source (auditável)

## 🛠️ Tecnologias

- React + TypeScript
- Tailwind CSS
- sql.js (SQLite no navegador)
- Vite
- shadcn/ui

## 📋 Requisitos do Backup

- Arquivo `.db` do iMazing (SQLite)
- Tabela `messages` com campos:
  - `id`, `nome_contato`, `source_file`
  - `data_hora_envio`, `tipo_mensagem`
  - `texto_mensagem`, `anexo_id_arquivo`
  - `anexo_tipo`, `anexo_tamanho`
  - E outros campos relevantes

## 🤝 Contribuindo

Este projeto foi criado no [Lovable](https://lovable.dev). Para contribuir:

1. Clone o repositório
2. `npm install`
3. `npm run dev`
4. Faça suas alterações
5. Envie um PR

## 📝 Licença

MIT License - use como quiser!

---

**Feito com ❤️ no [Lovable](https://lovable.dev)**
