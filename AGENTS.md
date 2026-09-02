# AGENTS.md - Rose Project

## Visão Geral

Este projeto é um repositório de estudo e documentação do OpenCode, o agente de código AI open source da Anomaly.

## Comandos Úteis

- `opencode` - Inicia o TUI do OpenCode
- `opencode serve` - Inicia o servidor headless (porta padrão: 4096)
- `opencode run "prompt"` - Executa um prompt diretamente
- `/init` - Analisa o projeto e cria AGENTS.md
- `/share` - Compartilha a sessão atual
- `/undo` - Desfaz a última mudança
- `/redo` - Refaz a última mudança desfeita

## Convenções

- Documentação em Markdown na pasta `docs/`
- Configuração do projeto em `opencode.json`
- Agentes customizados em `.opencode/agents/`
- Comandos customizados em `.opencode/commands/`
