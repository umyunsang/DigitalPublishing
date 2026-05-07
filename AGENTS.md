# AGENTS.md

## Project Context

This repository is a Digital Publishing course workspace for static HTML/CSS and pre-frontend design practice. Treat it as a design and layout lab first, not as a production web app.

The main learning targets are visual hierarchy, page structure, layout systems, typography, spacing, color, image use, and design handoff before full frontend development.

## Repository Shape

- Root HTML files are standalone class exercises.
- `css/` contains external styles for selected exercises.
- `images/`, `uploads/`, and nested weekly folders contain class assets and examples.
- `docs/`, `ai/`, `design-system/`, and `.agents/skills/` contain the AI-assisted design workflow added for this course.

## Working Rules

- Preserve existing student/class examples unless the user explicitly asks to revise them.
- Do not introduce React, Next.js, build tooling, package managers, bundlers, or backend code unless requested.
- Prefer plain HTML, CSS, Markdown, JSON, and lightweight documentation artifacts.
- Keep Korean content and course context intact.
- For new exercises, create a focused folder or clearly named HTML/CSS pair instead of mixing unrelated work into existing examples.
- Use static design reasoning before code: brief, content inventory, layout spec, tokens, then markup/CSS.

## Design Standards

- Prioritize readable hierarchy, consistent spacing, clear grouping, and asset fit.
- Treat fixed-width layouts as valid when they match the exercise goal.
- When responsive behavior is not part of the assignment, note it as a limitation instead of rewriting the exercise.
- Check accessibility basics: text alternatives, contrast, heading order, meaningful link text, keyboard-safe interactions where JavaScript appears.
- Use `design-system/tokens.json` as the local token reference when a new page needs shared color, type, spacing, or radius decisions.

## Codex Workflow

- Use `$design-brief-to-layout` when the task starts from a concept, assignment brief, or visual direction.
- Use `$png-layout-to-html` when the user provides a PNG/JPG layout blueprint, annotated screenshot, or wireframe image and wants HTML/CSS based on it.
- Use `$static-design-review` when reviewing existing HTML/CSS pages, screenshots, Figma exports, or layout exercises.
- Use `$figma-static-workflow` when a Figma link, Figma MCP, Figma variables, or design-to-code handoff is involved.
- For ambiguous design requests, produce a short design spec first, then implement only if the user wants code.

## Verification

- Static pages can be opened directly in a browser.
- For documentation-only changes, verify links, file paths, and Markdown structure.
- For HTML/CSS changes, inspect the referenced files and mention any visual checks that could not be performed.
