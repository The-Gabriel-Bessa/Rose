# OpenCode SDK (JS/TS)

## Instalação

```bash
npm install @opencode-ai/sdk
```

## Criar Cliente

### Iniciar servidor + cliente

```typescript
import { createOpencode } from "@opencode-ai/sdk"

const { client } = await createOpencode()
// Servidor rodando em http://127.0.0.1:4096
```

### Conectar a servidor existente

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
})
```

## Opções

| Opção | Tipo | Descrição | Padrão |
|-------|------|-----------|--------|
| `hostname` | `string` | Host do servidor | `127.0.0.1` |
| `port` | `number` | Porta do servidor | `4096` |
| `signal` | `AbortSignal` | Sinal de cancelamento | - |
| `timeout` | `number` | Timeout para iniciar (ms) | `5000` |
| `config` | `Config` | Configuração inline | `{}` |

## Tipos

```typescript
import type { Session, Message, Part } from "@opencode-ai/sdk"
```

Todos os tipos são gerados da spec OpenAPI do servidor.

## Uso por Namespace

### Global
```typescript
const health = await client.global.health()
// { healthy: true, version: string }
```

### Sessions
```typescript
// Criar sessão
const session = await client.session.create({
  body: { title: "Minha sessão" }
})

// Listar sessões
const sessions = await client.session.list()

// Enviar prompt
const result = await client.session.prompt({
  path: { id: session.id },
  body: {
    model: { providerID: "anthropic", modelID: "claude-sonnet-4-5" },
    parts: [{ type: "text", text: "Olá!" }],
  },
})

// Prompt async (não espera resposta)
await client.session.prompt({
  path: { id: session.id },
  body: {
    noReply: true,
    parts: [{ type: "text", text: "Contexto adicional" }],
  },
})

// Abortar sessão
await client.session.abort({ path: { id: session.id } })

// Compartilhar
await client.session.share({ path: { id: session.id } })
```

### Files
```typescript
// Buscar texto
const results = await client.find.text({
  query: { pattern: "function.*opencode" },
})

// Buscar arquivos
const files = await client.find.files({
  query: { query: "*.ts", type: "file" },
})

// Ler arquivo
const content = await client.file.read({
  query: { path: "src/index.ts" },
})
```

### Config
```typescript
const config = await client.config.get()
const { providers, default: defaults } = await client.config.providers()
```

### Events
```typescript
const events = await client.event.subscribe()
for await (const event of events.stream) {
  console.log("Event:", event.type, event.properties)
}
```

### TUI
```typescript
await client.tui.appendPrompt({ body: { text: "Texto no prompt" } })
await client.tui.submitPrompt()
await client.tui.showToast({
  body: { message: "Tarefa concluída", variant: "success" },
})
```

## Structured Output

```typescript
const result = await client.session.prompt({
  path: { id: sessionId },
  body: {
    parts: [{ type: "text", text: "Pesquise a empresa X" }],
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          company: { type: "string" },
          founded: { type: "number" },
        },
        required: ["company", "founded"],
      },
    },
  },
})

console.log(result.data.info.structured_output)
// { company: "Exemplo", founded: 2020 }
```

## Error Handling

```typescript
try {
  await client.session.get({ path: { id: "invalid" } })
} catch (error) {
  console.error("Erro:", (error as Error).message)
}
```
