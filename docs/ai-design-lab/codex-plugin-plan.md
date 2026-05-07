# Codex Skill and Plugin Plan

## Current Setup

This repo uses repo-local skills first:

- `.agents/skills/design-brief-to-layout`
- `.agents/skills/static-design-review`
- `.agents/skills/figma-static-workflow`

This is the right first step because the class workflow is still local to one course folder and should be easy to edit.

## When to Package as a Plugin

Create a Codex plugin when at least two of these are true:

- The same skills are useful across multiple course repositories.
- The skills need bundled MCP setup, such as Figma MCP or OpenAI Docs MCP.
- The workflow needs a recognizable install surface for students or collaborators.
- The skill set becomes stable enough that direct editing is no longer the main workflow.

## Future Plugin Shape

```text
digital-publishing-design-plugin/
├── .codex-plugin/
│   └── plugin.json
├── skills/
│   ├── design-brief-to-layout/
│   ├── static-design-review/
│   └── figma-static-workflow/
├── .mcp.json
└── assets/
```

## Candidate Manifest Fields

- `name`: `digital-publishing-design`
- `description`: Codex skills for static digital publishing design workflows.
- `skills`: `./skills/`
- `mcpServers`: `./.mcp.json`
- `keywords`: `design`, `digital-publishing`, `figma`, `static-html`, `llmops`

## MCP Candidates

- OpenAI Docs MCP for current Codex/OpenAI references.
- Figma MCP for design context and code-to-canvas workflows.
- Context7 for current library documentation when a later frontend assignment needs it.

Do not include authenticated MCP servers in a plugin until the installation flow and privacy expectations are clear.
