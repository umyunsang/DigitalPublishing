# Static Design Review Reference

Review in this order:

1. Assignment fit
2. Visual hierarchy
3. Layout and grouping
4. Spacing rhythm
5. Typography
6. Color and contrast
7. Image treatment and alt text
8. HTML semantics
9. CSS maintainability for the exercise level

Do not penalize fixed-width layout when fixed width is the assignment. Do note overflow and readability risks.

Prefer concrete comments:

- "The `section` gap changes from 24px to 60px without a content reason."
- "The card title and body share the same weight, so the scan path is weak."
- "The image has a fixed width and height that distorts the source ratio."

Avoid generic comments:

- "Make it more modern."
- "Improve UI."
- "Use a framework."
