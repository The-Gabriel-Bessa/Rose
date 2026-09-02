# OpenCode - Contexto e Limites

## O que é Contexto no OpenCode

O contexto é o "estado da conversa" que o LLM utiliza para gerar respostas. Inclui:

1. **System Prompt** - Instruções base do agente
2. **Histórico de Mensagens** - Todas as mensagens da sessão
3. **Tool Outputs** - Resultados de ferramentas (file reads, bash, etc.)
4. **AGENTS.md** - Instruções do projeto (carregado automaticamente)
5. **Rules/Instructions** - Arquivos de instruções configurados
6. **LSP Context** - Informações de linguagem (types, symbols)

## Limites de Contexto

### Token Limits

O limite de contexto depende do modelo LLM utilizado:

| Modelo | Contexto Máximo |
|--------|----------------|
| Claude Sonnet 4.5 | 200K tokens |
| Claude Haiku 4.5 | 200K tokens |
| GPT-4o | 128K tokens |
| Gemini 1.5 Pro | 1M tokens |
| Gemini 1.5 Flash | 1M tokens |

### O que consome contexto rapidamente

- **Arquivos grandes** lidos com a tool `read`
- **Saída de comandos bash** extensos
- **Muitas tools** chamadas em sequência
- **Imagens** (consomem muitos tokens)
- **Histórico longo** de conversas

## Compaction (Compactação)

Quando o contexto fica cheio, o OpenCode pode compactar automaticamente:

```json
{
  "compaction": {
    "auto": true,    // Compacta automaticamente
    "prune": false,  // Remove outputs de tools antigas
    "reserved": 10000 // Buffer de tokens para evitar overflow
  }
}
```

### Como funciona

1. O sistema monitora o uso de tokens
2. Quando atinge o limite, dispara compaction
3. Mensagens antigas são resumidas
4. Outputs de tools antigos podem ser removidos (se `prune: true`)
5. O contexto continua disponível de forma comprimida

### Dicas para economizar contexto

1. **Use `small_model`** para tarefas leves (geração de título, resumos)
2. **Limite o tamanho** de arquivos lidos
3. **Use `/undo`** para desfazer mudanças desnecessárias
4. **Inicie sessões novas** para contextos diferentes
5. **Configure `prune: true`** se precisar de sessões longas

## Agents e Subagents

### Agentes Built-in

| Agent | Descrição |
|-------|-----------|
| `build` | Padrão, acesso total para desenvolvimento |
| `plan` | Somente leitura, para análise e planejamento |

### Subagents

- São invocados internamente com `@general`
- Executam tarefas complexas de forma autônoma
- Têm seu próprio contexto (não compartilham com o pai)
- Profundidade configurável com `subagent_depth`:

```json
{
  "subagent_depth": 1  // 0 = sem subagents, 1 = padrão, 2 = aninhamento
}
```

## Sessões

### Ciclo de Vida

1. **Criação** - `POST /session` ou TUI
2. **Mensagens** - `POST /session/:id/message`
3. **Compartilhamento** - `POST /session/:id/share`
4. **Resumo** - `POST /session/:id/summarize`
5. **Delete** - `DELETE /session/:id`

### Snapshot (Undo/Redo)

Cada mudança de arquivo gera um snapshot:

```json
{
  "snapshot": true  // Habilita undo/redo
}
```

- `/undo` - Reverte última mudança
- `/redo` - Restaura mudança desfeita
- Snapshots usam git internamente

## AGENTS.md

Arquivo especial que o OpenCode carrega automaticamente na raiz do projeto:

```markdown
# AGENTS.md

## Visão Geral
Descrição do projeto...

## Comandos
Comandos úteis...

## Convenções
Padrões do projeto...
```

### Dicas

- Commit este arquivo no git
- Mantenha atualizado
- Use para documentar padrões do projeto
- O agente usa como referência para todas as interações

## Permissions

Controle o que o agente pode fazer:

```json
{
  "permission": {
    "bash": "ask",    // Pergunta antes de rodar comandos
    "edit": "ask",    // Pergunta antes de editar arquivos
    "write": "ask"    // Pergunta antes de criar arquivos
  }
}
```

### Valores

- `"allow"` - Permite sem perguntar (padrão)
- `"ask"` - Pergunta ao usuário
- `"deny"` - Negado

## MCP Servers

Model Context Protocol permite integrar ferramentas externas:

```json
{
  "mcp": {
    "meu-servidor": {
      "type": "stdio",
      "command": "meu-servidor",
      "args": []
    }
  }
}
```

## LSP Integration

O OpenCode carrega LSP servers automaticamente para:

- TypeScript/JavaScript
- Python
- Rust
- Go
- E outros

```json
{
  "lsp": true  // Habilita LSP automático
}
```

## Plugins

Extendem o OpenCode com tools customizadas:

```json
{
  "plugin": ["opencode-helicone-session"]
}
```

Ou arquivos em `.opencode/plugins/`.
