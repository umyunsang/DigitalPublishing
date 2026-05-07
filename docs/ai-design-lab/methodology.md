# LLMOps-Based Static Design Methodology

## Principle

Use LLMOps ideas without overbuilding infrastructure. For this class, "LLMOps" means prompts, sources, design tokens, review criteria, and iterations are versioned enough that a student can explain how a static design decision was made.

## Workflow

1. Brief
   - Define audience, purpose, content, mood, constraints, and deliverables.
   - Save in `docs/templates/design-brief.md` format.

2. Reference
   - Gather course examples, Figma links, screenshots, and source links.
   - When the reference is an annotated PNG layout blueprint, treat its red notes, measurements, and arrows as requirements.
   - Separate factual source material from visual inspiration.

3. System
   - Choose grid, spacing scale, type scale, color tokens, radius, and image rules.
   - Use `design-system/tokens.json` as a starter.

4. Layout
   - Produce a static layout spec before writing HTML/CSS.
   - Use `docs/templates/layout-spec.md`.
   - Use `docs/templates/png-layout-to-html-spec.md` when the source is a PNG/JPG layout blueprint.

5. Build
   - Implement only the necessary static HTML/CSS.
   - Avoid framework migration unless the assignment requires it.

6. Evaluate
   - Review against `docs/rubrics/static-design-rubric.md`.
   - Capture issues as concrete fixes: hierarchy, alignment, rhythm, contrast, semantics, asset fit.

7. Archive
   - Save reusable prompts in `ai/prompts/`.
   - Save notable review/eval notes in `ai/runs/`.

## Lightweight LLMOps Artifacts

| Artifact | Why It Exists |
| --- | --- |
| Prompt | Makes intent repeatable. |
| Source map | Keeps AI output grounded. |
| Token sheet | Prevents arbitrary visual decisions. |
| Layout spec | Bridges design and HTML/CSS. |
| Rubric | Makes critique comparable. |
| Session log | Tracks what changed after AI feedback. |

## When to Use Heavier Tools

- Use Promptfoo when you want to compare multiple review prompts or models against the same design brief.
- Use Langfuse when you are building a real LLM application and need tracing, prompt versions, datasets, or production evals.
- Use OpenTelemetry GenAI conventions when traces need to move across tools or observability systems.
- Do not require these tools for normal static design homework.
