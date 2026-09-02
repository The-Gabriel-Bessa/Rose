# OpenCode Config - Referência

## Formato

Suporta **JSON** e **JSONC** (com comments):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "autoupdate": true
}
```

## Locais de Configuração

As configs são **merged** (não substituídas). Ordem de precedência:

1. **Remote** - `.well-known/opencode` (organizacionais)
2. **Global** - `~/.config/opencode/opencode.json`
3. **Custom** - `OPENCODE_CONFIG` env var
4. **Project** - `opencode.json` na raiz do projeto
5. **`.opencode`** - agents, commands, plugins
6. **Inline** - `OPENCODE_CONFIG_CONTENT` env var
7. **Managed** - `/Library/Application Support/opencode/` (macOS)

## Schema

- Config principal: `https://opencode.ai/config.json`
- Config TUI: `https://opencode.ai/tui.json`

## Principais Opções

### Modelos
```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5"
}
```

### Provider
```json
{
  "provider": {
    "anthropic": {
      "options": {
        "timeout": 600000,
        "chunkTimeout": 30000,
        "setCacheKey": true
      }
    }
  }
}
```

### Servidor
```json
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true,
    "cors": ["http://localhost:5173"]
  }
}
```

### Shell
```json
{
  "shell": "pwsh"
}
```

### Tools (habilitar/desabilitar)
```json
{
  "tools": {
    "write": false,
    "bash": false
  }
}
```

### Agents Customizados
```json
{
  "agent": {
    "code-reviewer": {
      "description": "Revisa código para boas práticas",
      "model": "anthropic/claude-sonnet-4-5",
      "prompt": "Você é um revisor de código.",
      "tools": {
        "write": false,
        "edit": false
      }
    }
  }
}
```

### Comandos Customizados
```json
{
  "command": {
    "test": {
      "template": "Rode a suíte de testes com cobertura",
      "description": "Roda testes com coverage",
      "agent": "build"
    }
  }
}
```

### Permissões
```json
{
  "permission": {
    "edit": "ask",
    "bash": "ask"
  }
}
```

### Compaction (Contexto)
```json
{
  "compaction": {
    "auto": true,
    "prune": false,
    "reserved": 10000
  }
}
```

### MCP Servers
```json
{
  "mcp": {}
}
```

### Instructions
```json
{
  "instructions": ["CONTRIBUTING.md", "docs/guidelines.md", ".cursor/rules/*.md"]
}
```

### Sharing
```json
{
  "share": "manual"  // "auto" | "disabled"
}
```

### Snapshot (Undo/Redo)
```json
{
  "snapshot": true
}
```

### Autoupdate
```json
{
  "autoupdate": true  // false | "notify"
}
```

### Formatters
```json
{
  "formatter": true
}
```

### LSP
```json
{
  "lsp": true
}
```

### Watcher
```json
{
  "watcher": {
    "ignore": ["node_modules/**", "dist/**", ".git/**"]
  }
}
```

### Image Attachments
```json
{
  "attachment": {
    "image": {
      "auto_resize": true,
      "max_width": 2000,
      "max_height": 2000,
      "max_base64_bytes": 5242880
    }
  }
}
```

### Providers Desabilitados/Habilitados
```json
{
  "disabled_providers": ["openai"],
  "enabled_providers": ["anthropic", "gemini"]
}
```

## Variáveis

### Env vars
```json
{
  "model": "{env:OPENCODE_MODEL}"
}
```

### Arquivos
```json
{
  "provider": {
    "openai": {
      "options": {
        "apiKey": "{file:~/.secrets/openai-key}"
      }
    }
  }
}
```

## TUI Config (tui.json)

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "tokyonight",
  "scroll_speed": 3,
  "mouse": true,
  "cursor": {
    "style": "block",
    "blinking": true
  }
}
```
