# AGENTS.md - Rose Project

## Visão Geral

O Rose é um orquestrador autônomo que se integra ao OpenCode para transformar especificações de usuário em software funcional e validado.

## Arquitetura

```
Rose
├── src/
│   ├── core/                    # Engine principal
│   │   ├── state-machine.ts     # Máquina de estados
│   │   ├── memory.ts            # Memória do projeto
│   │   └── orchestrator.ts      # Orquestrador principal
│   ├── opencode-adapter/        # Integração com OpenCode
│   │   ├── client.ts            # Cliente SDK
│   │   └── session-manager.ts   # Gerenciamento de sessões
│   ├── persistence/             # Persistência de estado
│   │   └── storage.ts           # Armazenamento em disco
│   ├── types/                   # Definições de tipos
│   │   ├── state.ts             # Estados do Rose
│   │   ├── project.ts           # Tipos do projeto
│   │   └── diagnostics.ts       # Diagnósticos
│   └── index.ts                 # Entry point
├── docs/                        # Documentação
├── opencode.json                # Configuração do OpenCode
└── package.json                 # Dependências
```

## Comandos Úteis

- `npm run build` - Compila o projeto
- `npm run dev` - Executa em modo desenvolvimento
- `npm run typecheck` - Verifica tipos
- `opencode` - Inicia o TUI do OpenCode
- `opencode serve` - Inicia o servidor headless

## Workflow do Rose

1. **ANALYZING** - Analisa objetivo do usuário
2. **PLANNING** - Cria plano de implementação
3. **IMPLEMENTING** - Delega implementação ao OpenCode
4. **BUILDING** - Compila o projeto
5. **TESTING** - Executa testes
6. **INSPECTING** - Verifica resultados
7. **BUG_FOUND** - Detecta e diagnostica bugs
8. **FIXING** - Envia correções ao OpenCode
9. **RETESTING** - Re-executa testes
10. **IMPROVEMENT_SCAN** - Busca melhorias
11. **FINAL_VALIDATION** - Validação final
12. **CODE_REVIEW** - Revisão de código
13. **COMPLETED** - Entrega

## Convenções

- TypeScript estrito com tipos
- Persistência em `.rose/project-state.json`
- Integração via SDK `@opencode-ai/sdk`
- Estados definidos em `src/types/state.ts`
