---
name: figma-static-workflow
description: Guide Figma-to-static-design workflows for Digital Publishing, including Figma MCP links, selected frames, screenshots, Figma variables, design context extraction, code-to-canvas review, and static HTML/CSS handoff. Use when the user mentions Figma, MCP, Dev Mode, design handoff, frame links, screenshots, variables, or moving between canvas and code.
---

# Figma Static Workflow

## Overview

Use Figma context to support static design planning and review. Keep the output focused on layout specs, tokens, assets, and plain HTML/CSS implementation notes.

## Workflow

1. Determine whether Figma MCP, a Figma URL, or only a screenshot/export is available.
2. If MCP is available, use selected frame context rather than an entire heavy file.
3. Extract hierarchy, layout, spacing, type, colors, variables, component names, and assets.
4. Convert the design into a static layout spec before writing code.
5. Preserve design-system components and variables when they exist.
6. If code-to-canvas is requested, document what should be captured back into Figma for critique.

## Output

Use this handoff shape:

- Figma source and scope
- Extracted hierarchy
- Layout and token notes
- Asset handling
- Static HTML/CSS plan
- Open assumptions
- Review checklist

## References

Read `references/mcp-notes.md` when MCP availability or Figma handoff steps matter.
