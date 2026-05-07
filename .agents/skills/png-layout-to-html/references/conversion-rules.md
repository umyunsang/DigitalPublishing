# PNG Layout to HTML Conversion Rules

## Read the Layout Image First

Extract these details before coding:

- Overall canvas width and centered container width.
- Header zones: logo/name, navigation, alignment rules.
- Main visual zones: hero image area, image count, scroll behavior, background blocks.
- Content zones: headings, cards, paragraphs, footer.
- Measurements written on the image, such as `100%`, `1400px`, `30px`, `20px`, `18px`, `16px`, or `130%`.
- Interaction notes, such as link targets, hover color, underline removal, border radius, and shadow.
- Required image paths/names when called out by the annotation.

## Translate Annotations Into HTML/CSS

- Use semantic blocks: `header`, `nav`, `main`, `section`, `article`, `footer`.
- Keep the annotated container width when it is part of the assignment.
- Use `margin: 0 auto` for centered fixed-width wrappers.
- Use `text-align: right` or flex alignment for right-aligned nav areas.
- Use `display: flex` for horizontal card rows unless the assignment requires another technique.
- Use `overflow-y: auto` for vertical scroll regions when the layout says vertical scroll.
- Use CSS hover states exactly when specified: menu hover color can differ from normal link color, and underline can be removed if noted.
- Use `border-radius` and `box-shadow` for card styling when annotations mention rounded corners and shadow.

## Output Before Code

For ambiguous images, first produce a short interpretation:

- Inferred page width.
- Main wrapper width.
- Header/nav behavior.
- Hero image requirement.
- Card count and card contents.
- Footer layout.
- Open questions about images or text.

Then create files only after assumptions are clear or low risk.

## Course Constraints

Do not introduce frameworks or build tools. Use standalone HTML and CSS. If the user asks for one file, keep CSS inline; otherwise prefer an HTML file plus a CSS file.
