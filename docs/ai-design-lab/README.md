# AI Design Lab Setup

This folder turns the Digital Publishing class workspace into a lightweight AI-assisted static design lab.

## What Was Added

- `AGENTS.md`: persistent project instructions for Codex and compatible coding agents.
- `.agents/skills/`: repo-local Codex skills for recurring course workflows.
- `docs/research/`: research notes and source map.
- `docs/templates/`: reusable design planning and review templates.
- `docs/rubrics/`: evaluation rubrics for static design work.
- `ai/prompts/`: prompt playbooks for Codex or other LLM tools.
- `ai/evals/`: lightweight prompt/design evaluation examples.
- `design-system/`: starter design tokens for class exercises.
- `.codex/config.toml.example`: optional MCP configuration reference.
- `docs/ai-design-lab/codex-plugin-plan.md`: future packaging plan for a reusable Codex plugin.

## Recommended Course Workflow

1. Start with `docs/templates/design-brief.md`.
2. Convert the brief into a layout spec with `docs/templates/layout-spec.md`.
3. If the class provides a PNG layout blueprint, analyze it with `docs/templates/png-layout-to-html-spec.md`.
4. Choose tokens from `design-system/tokens.json`.
5. Create or revise the static HTML/CSS exercise.
6. Review the output with `docs/rubrics/static-design-rubric.md`.
7. Save AI session notes with `docs/templates/llm-session-log.md` when the prompt or review result is worth reusing.

## Codex Skills

- `$design-brief-to-layout`: turns a design prompt into a static layout plan.
- `$png-layout-to-html`: converts annotated PNG/JPG layout blueprints into static HTML/CSS plans or files.
- `$static-design-review`: reviews static HTML/CSS, Figma exports, or screenshots against course criteria.
- `$figma-static-workflow`: guides Figma MCP and design handoff workflows without forcing a full frontend stack.

## Optional MCP Setup

The example config in `.codex/config.toml.example` lists OpenAI Docs MCP and Figma MCP. Copy only the servers you actually need into `.codex/config.toml`, then authenticate them in Codex. Keep this optional because Figma and other remote tools require account access.
