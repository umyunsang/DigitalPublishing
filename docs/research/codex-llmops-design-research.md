# Codex, LLMOps, and Static Design Research

Research date: 2026-05-07

## Core Insight

This class is not primarily about shipping a frontend application. It is about the static design layer immediately before frontend development: layout, visual hierarchy, typography, design tokens, wireframes, Figma handoff, and HTML/CSS exercises.

The best Codex setup is therefore not "make everything an app." It is a repeatable design-operations layer: durable agent instructions, focused skills, source-backed design references, prompt templates, and review rubrics.

## Findings

| Area | What Matters | Course Application |
| --- | --- | --- |
| Codex project guidance | OpenAI recommends `AGENTS.md` for durable repo guidance and concise project rules. | Root `AGENTS.md` now tells Codex to preserve static exercises and work design-first. |
| Codex skills | Skills package reusable instructions, references, scripts, and assets. Repo skills live in `.agents/skills`. | Three repo-local skills cover brief-to-layout, static review, and Figma workflow. |
| Codex plugins | Plugins distribute skills, apps, and MCP server setup as installable bundles. | This repo keeps skills local first. A course plugin can be made later if the workflow stabilizes. |
| MCP | MCP connects Codex to external context such as docs, Figma, browsers, and GitHub. | Optional `.codex/config.toml.example` documents OpenAI Docs MCP and Figma MCP without forcing auth. |
| Figma MCP | Figma MCP can provide design context from selected frames and bring live UI back to editable Figma frames. | Useful for Figma-to-static-HTML critique, token extraction, and design handoff exercises. |
| Prompt evaluation | Promptfoo supports test-driven prompt evaluation and red teaming. | Use it lightly for prompt/rubric experiments, not as a mandatory dependency. |
| Observability | Langfuse and OpenTelemetry help trace LLM apps and agent workflows. | For this static class, keep manual run logs first. Add observability only for larger AI projects. |
| Design systems | DTCG design tokens, Figma variables, Atomic Design, and WCAG form the stable design method base. | Starter token JSON, layout templates, and review rubrics map these methods into class artifacts. |

## Recommended Stack

- Required: `AGENTS.md`, `.agents/skills`, Markdown templates, local design tokens.
- Optional: OpenAI Docs MCP for current OpenAI/Codex references.
- Optional: Figma MCP for Figma frame context and code-to-canvas work.
- Optional: Promptfoo for comparing prompt versions or rubric outputs.
- Later: package the stable class workflow as a Codex plugin with `.codex-plugin/plugin.json`.

## Source Map

- OpenAI Codex best practices: https://developers.openai.com/codex/learn/best-practices
- OpenAI AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- OpenAI Agent Skills: https://developers.openai.com/codex/skills
- OpenAI Plugins: https://developers.openai.com/codex/plugins
- OpenAI Build plugins: https://developers.openai.com/codex/plugins/build
- OpenAI MCP guide: https://developers.openai.com/codex/mcp
- OpenAI prompt engineering, coding/front-end section: https://developers.openai.com/api/docs/guides/prompt-engineering#coding
- AGENTS.md open format: https://agents.md/
- Agent Skills specification: https://agentskills.io/specification
- OpenAI skills catalog: https://github.com/openai/skills
- OpenAI Codex CLI repository: https://github.com/openai/codex
- Figma and Codex workflow blog: https://www.figma.com/blog/introducing-codex-to-figma/
- Figma MCP remote server setup: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Figma MCP desktop server setup: https://developers.figma.com/docs/figma-mcp-server/local-server-installation/
- Figma variables guide: https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma
- Model Context Protocol tools spec: https://modelcontextprotocol.io/specification/2025-06-18/server/tools
- Promptfoo docs: https://www.promptfoo.dev/docs/intro/
- Langfuse docs: https://langfuse.com/docs
- OpenTelemetry GenAI semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/
- W3C Design Tokens Community Group: https://www.w3.org/community/design-tokens/
- Atomic Design methodology: https://atomicdesign.bradfrost.com/chapter-2/
- WCAG 2.2: https://www.w3.org/TR/wcag/
