# OpenCode API Reference

## Visão Geral

O OpenCode expõe uma API REST completa via OpenAPI 3.1. O servidor é iniciado com `opencode serve` ou automaticamente quando o TUI é aberto.

## URL Base

```
http://<hostname>:<port>
```

- Hostname padrão: `127.0.0.1`
- Porta padrão: `4096`

## Documentação OpenAPI

A spec completa está disponível em:

```
http://localhost:4096/doc
```

## Autenticação

O servidor pode ser protegido com HTTP Basic Auth:

```bash
OPENCODE_SERVER_PASSWORD=sua-senha opencode serve
```

- Username padrão: `opencode`
- Override: `OPENCODE_SERVER_USERNAME`

## Endpoints Principais

### Global
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/global/health` | Health check + versão |
| `GET` | `/global/event` | SSE stream de eventos globais |

### Projetos
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/project` | Lista projetos |
| `GET` | `/project/current` | Projeto atual |

### Config
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/config` | Retorna configuração |
| `PATCH` | `/config` | Atualiza configuração |
| `GET` | `/config/providers` | Lista providers e modelos padrão |

### Sessions
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/session` | Lista sessões |
| `POST` | `/session` | Cria sessão |
| `GET` | `/session/:id` | Detalhes da sessão |
| `DELETE` | `/session/:id` | Deleta sessão |
| `PATCH` | `/session/:id` | Atualiza sessão |
| `POST` | `/session/:id/init` | Analisa app, cria AGENTS.md |
| `POST` | `/session/:id/abort` | Aborta sessão |
| `POST` | `/session/:id/share` | Compartilha sessão |
| `POST` | `/session/:id/summarize` | Resume sessão |
| `POST` | `/session/:id/revert` | Reverte mensagem |
| `POST` | `/session/:id/unrevert` | Restaura revert |

### Messages
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/session/:id/message` | Lista mensagens |
| `POST` | `/session/:id/message` | Envia mensagem (sync) |
| `POST` | `/session/:id/prompt_async` | Envia mensagem (async) |
| `GET` | `/session/:id/message/:msgID` | Detalhes da mensagem |

### Files
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/find?pattern=<pat>` | Busca texto em arquivos |
| `GET` | `/find/file?query=<q>` | Busca arquivos por nome |
| `GET` | `/find/symbol?query=<q>` | Busca símbolos |
| `GET` | `/file?path=<path>` | Lista arquivos/diretórios |
| `GET` | `/file/content?path=<p>` | Lê conteúdo de arquivo |
| `GET` | `/file/status` | Status de arquivos rastreados |

### Providers
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/provider` | Lista todos providers |
| `GET` | `/provider/auth` | Métodos de auth dos providers |
| `POST` | `/provider/:id/oauth/authorize` | Inicia OAuth |
| `POST` | `/provider/:id/oauth/callback` | Callback OAuth |

### Tools (Experimental)
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/experimental/tool/ids` | Lista IDs das tools |
| `GET` | `/experimental/tool?provider=<p>&model=<m>` | Tools com JSON schemas |

### Agents
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/agent` | Lista agents disponíveis |

### Auth
| Método | Path | Descrição |
|--------|------|-----------|
| `PUT` | `/auth/:id` | Seta credenciais de auth |

### Events
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/event` | SSE stream (primeiro evento: `server.connected`) |

### TUI (controle remoto)
| Método | Path | Descrição |
|--------|------|-----------|
| `POST` | `/tui/append-prompt` | Adiciona texto ao prompt |
| `POST` | `/tui/submit-prompt` | Submete prompt atual |
| `POST` | `/tui/clear-prompt` | Limpa prompt |
| `POST` | `/tui/execute-command` | Executa comando |
| `POST` | `/tui/show-toast` | Mostra notificação |

### Outros
| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/path` | Caminho atual |
| `GET` | `/vcs` | Info do VCS |
| `GET` | `/lsp` | Status dos LSP servers |
| `GET` | `/formatter` | Status dos formatters |
| `GET` | `/mcp` | Status dos MCP servers |
| `POST` | `/mcp` | Adiciona MCP server dinamicamente |
| `POST` | `/log` | Escreve log |
| `GET` | `/doc` | Spec OpenAPI (HTML) |
