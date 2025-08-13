# Code Style Guide

## Context

Global code style rules for my Agent OS projects, using Django (Python), React (JavaScript), and TailwindCSS.

---

## General Formatting

### Indentation
- Use **4 spaces** for Python code (PEP 8 standard)
- Use **2 spaces** for JavaScript/React and HTML/CSS (common frontend convention)
- Never use tabs
- Keep indentation consistent across files

### Naming Conventions
- **Python (Django)**:
  - Variables & functions: `snake_case`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **JavaScript (React)**:
  - Variables & functions: `camelCase`
  - React components: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`

### String Formatting
- **Python**: Use single quotes `'example'` by default; use double quotes if the string contains a single quote
- Use `f-strings` for formatting: `f"Hello {name}"`
- **JavaScript**:
  - Use single quotes `'example'` unless double quotes improve readability
  - Use template literals for multiline or interpolated strings: `` `Hello ${name}` ``

### Code Comments
- Add comments for complex logic or important decisions
- Use `#` for Python comments
- Use `//` and `/* */` for JavaScript
- Keep comments concise, relevant, and updated as code evolves
- Avoid redundant comments (e.g., `# increment i by 1` for `i += 1`)

---

## Python (Django) Style

- Follow [PEP 8](https://peps.python.org/pep-0008/) for all Python code
- Use Django’s built-in tools (e.g., `Model.objects.filter()`, `get_object_or_404`)
- Organize imports: standard lib > third-party > local imports
- Keep views thin, move logic to services or model methods

---

## React & JavaScript Style

- Use functional components with hooks
- Avoid inline styles unless necessary
- Prefer `const` and `let` over `var`
- Use arrow functions: `const handleClick = () => {}`

---

## TailwindCSS Style

- Keep class names short and ordered: layout → spacing → typography → color
- Use `@apply` in CSS files only for reusable groups (not everything)
- Avoid deeply nested custom CSS when Tailwind utility classes suffice
- Use responsive classes (`sm:`, `md:`, `lg:`) sparingly and meaningfully

---

## File Organization Tips (Optional)

- Use consistent folder structure: `components/`, `pages/`, `utils/`, `styles/`, `api/`
- Group Python files by app: `models.py`, `views.py`, `forms.py`, etc.
- Use `README.md` or inline comments to document folder/module purposes

---

## When in Doubt

- Prioritize readability over cleverness
- Keep functions and components small and focused
- Use version control (Git) for tracking and reverting changes

