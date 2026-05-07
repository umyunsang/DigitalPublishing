# Static Design Prompt Evaluation

Use this manually when comparing prompt versions or reviewing AI critique quality.

## Test Inputs

- A simple menu page.
- A news card layout.
- A Figma export with absolute positioning.
- A fixed-width exercise where responsiveness is intentionally out of scope.

## Expected Behavior

- The critique respects the assignment constraints.
- The critique identifies hierarchy and layout issues before cosmetic issues.
- The output gives actionable fixes, not vague praise.
- The output does not force React, Tailwind, or a build system.
- The output checks alt text, heading order, and contrast when relevant.

## Scoring

| Score | Meaning |
| --- | --- |
| 5 | Precise, course-aware, actionable, preserves constraints. |
| 3 | Mostly useful but misses one major design or course constraint. |
| 1 | Generic, over-engineered, or changes the assignment goal. |
