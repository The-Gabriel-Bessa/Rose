# OpenCode Server - Arquitetura

## Como Funciona

Quando você executa `opencode`, dois componentes são iniciados:

1. **Servidor** - Processo backend que expõe HTTP + OpenAPI
2. **TUI** - Cliente que se comunica com o servidor

O servidor pode rodar de forma isolada com `opencode serve` (headless).

## Iniciar Servidor

```bash
# Modo headless
opencode serve

# Com opções
opencode serve --port 4096 --hostname 127.0.0.1 --cors http://localhost:5173
```

## Flags

| Flag | Descrição | Padrão |
|------|-----------|--------|
| `--port` | Porta de escuta | `4096` |
| `--hostname` | Hostname de escuta | `127.0.0.1` |
| `--mdns` | Habilita mDNS discovery | `false` |
| `--mdns-domain` | Domínio mDNS customizado | `opencode.local` |
| `--cors` | Origens adicionais para CORS | `[]` |

## Autenticação

Proteja o servidor com HTTP Basic Auth:

```bash
OPENCODE_SERVER_PASSWORD=minha-senha opencode serve
```

- Username: `opencode` (override com `OPENCODE_SERVER_USERNAME`)

## Arquitetura

```
┌─────────────────────────────────────────────┐
│                  OpenCode                   │
├──────────────────┬──────────────────────────┤
│   TUI (Cliente)  │    Servidor (HTTP)       │
│                  │                          │
│  - Renderização  │  - OpenAPI 3.1 spec      │
│  - Input/Output  │  - Gerenciamento de      │
│  - Navegação     │    sessões               │
│                  │  - Integração com LLMs   │
│                  │  - File system access     │
│                  │  - Tools (bash, edit...)  │
│                  │  - LSP, Formatters, MCP   │
└──────────────────┴──────────────────────────┘
```

## SDK Client

O SDK JS/TS se conecta ao servidor:

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
})
```

## OpenAPI Spec

Acesse a spec interativa em:

```
http://localhost:4096/doc
```

## Eventos (SSE)

O servidor emite eventos via Server-Sent Events:

```typescript
const events = await client.event.subscribe()
for await (const event of events.stream) {
  console.log(event.type, event.properties)
}
```

Primeiro evento sempre é `server.connected`.
