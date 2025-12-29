---
description: "Summary of the Google TypeScript Style Guide for repository code generation"
applyTo: '**/*.ts, **/*.tsx'
---

---
description: "Google TypeScript Style Guide (detailed extract) for repository code generation"
applyTo: '**/*.ts, **/*.tsx'
---

# Google TypeScript Style Guide — Detailed Extract

This file provides a more detailed, sectioned extract of the Google TypeScript Style Guide to inform Copilot's repository-local code generation. It is intended to be read by the model and applied when generating TypeScript/TSX code for this project.

## 1. Introduction
- The guide uses RFC 2119 terminology (must, must not, should, should not, may). Use prefer/avoid to indicate soft recommendations.

## 2. Source file basics
- Files are encoded in UTF-8.
- Use ASCII horizontal space (0x20) only; escape other special whitespace characters in strings.
- For non-printable characters use Unicode escapes with an explanatory comment.

## 3. Source file structure
- File order (if present): 1) copyright JSDoc, 2) `@fileoverview` JSDoc, 3) imports, 4) implementation.
- Exactly one blank line separates each section.

### 3.1 Copyright and `@fileoverview`
- If present, put license/copyright as a JSDoc block at the top. Use `@fileoverview` for a short file description.

### 3.2 Imports
- Use path imports for TypeScript code. Prefer relative imports (`./`, `../`) for files inside the same logical project.
- Limit parent directory depth where possible.
- Use named imports for common symbols; prefer namespace imports when consuming many symbols from a large API.
- Use `import type { ... }` for type-only imports when appropriate.

### 3.3 Exports
- Use named exports exclusively; do not use default exports.
- Avoid mutable module-level exports (`export let`). Use functions or getters instead when mutability is required.

### 3.4 Import/export of types
- Use `import type` and `export type` for type-only imports/exports to aid isolatedModules and faster build modes.

## 4. Language features
This section condenses concrete, enforceable rules for everyday code generation.

### 4.1 Local variable declarations
- Use `const` by default; use `let` only when reassignment is required. Never use `var`.
- Declare one variable per declaration statement.
- Variables must not be used before their declaration.

### 4.2 Array literals
- Do not use the `Array()` constructor; use `[]` or `Array.from()` when appropriate.
- Do not define non-numeric properties on arrays; use `Map`/`Object` instead.
- Use spread (`...`) correctly — only spread iterables when creating arrays; avoid spreading `null`/`undefined`.

### 4.3 Object literals
- Use object literals `{}` instead of `new Object()`.
- Avoid `for (... in ...)` over arrays; prefer `for ... of`, `Object.keys`, `Object.values`, or `Object.entries`.
- Use object spread `{ ...obj }` carefully; only spread plain objects.

### 4.4 Classes
- Class declarations must not end with a semicolon. Class expressions (assigned to const/let) must end with a semicolon.
- Use `readonly` for fields not reassigned after construction.
- Do not use `#private` identifiers; use TypeScript `private`/`protected` modifiers instead.
- Prefer module-local functions over private static methods when clarity permits.
- Initialize fields at declaration to avoid changing object shape after construction.

### 4.5 Functions
- Prefer function declarations for named top-level functions.
- Use arrow functions for callbacks and nested functions where lexical `this` is useful.
- Avoid function expressions except when rebinding `this` or for generator functions.
- For concise arrow bodies, only use them when the return value is actually used; otherwise use block bodies.
- Default parameter initializers must not have observable side effects.

### 4.6 `this`
- Use `this` only in class constructors/methods or functions with an explicit `this` type or arrow functions defined in a scope where `this` is valid.

### 4.7 Interfaces
- Prefer `interface` rather than object `type` aliases for describing object shapes.

### 4.8 Primitive literals
- Use single quotes for ordinary string literals. Use template literals for multi-line or complex interpolation.
- Do not use line-continuation characters inside string literals.
- For numeric parsing use `Number()` and check for `NaN`; avoid unary `+` and `parseInt`/`parseFloat` for base-10 parsing.

### 4.9 Control structures
- Always use braces for control blocks (`if`, `for`, `while`), except where the guide allows concise single-line forms.
- Use `===`/`!==` generally; `== null` is acceptable to test for `null` or `undefined` together.
- Prefer `for ... of` for arrays.
- Keep `try` blocks focused and small.

### 4.10 Decorators
- Avoid creating new decorators; only use framework-provided decorators when necessary.
- Place JSDoc before decorators, and decorators immediately before the declaration with no blank line.

### 4.11 Disallowed features
- Do not use wrapper objects for primitives (`new String`, `new Number`, `new Boolean`).
- Do not rely on Automatic Semicolon Insertion — terminate statements with semicolons.
- Do not use `const enum` — use plain `enum`.
- Do not use `eval`, `with`, or dynamic code evaluation. Avoid modifying built-in prototypes.

## 5. Naming
- Use descriptive names; avoid ambiguous abbreviations.
- Casing: UpperCamelCase for classes/interfaces/types/enums/decorators; lowerCamelCase for variables/functions/methods/properties; CONSTANT_CASE for global constants.
- Do not use leading/trailing underscores; do not use `_` as an identifier for unused parameters.
- Type parameters may be single uppercase `T` or UpperCamelCase.

## 6. Type system
- Rely on type inference for simple initializers; add annotations for clarity or complex generics.
- Do not include `|null`/`|undefined` in type aliases unnecessarily; prefer optional `?` where appropriate.
- Prefer structural typing and explicit types at declaration sites to improve refactorability.
- Prefer `T[]` for simple arrays; use `Array<T>` for complex forms.
- Prefer `unknown` over `any`; document/justify `any` when used.

## 7. Toolchain requirements
- All TypeScript files must pass type checking with the project's compiler configuration.
- Avoid `@ts-ignore` and similar suppressions; fix the root cause where possible. Using `@ts-expect-error` is allowed in tests with caution.

## 8. Comments and documentation
- Use `/** ... */` JSDoc for exported APIs and `//` for implementation comments.
- JSDoc is written in Markdown. Document all top-level exports and non-obvious APIs.
- Multi-line comment blocks should use multiple `//` lines for implementation comments (avoid `/* */` block style for multi-line non-JSDoc comments).

## 9. Policies
- Be consistent with the surrounding file when the guide is not prescriptive. New files should follow Google Style.
- Do not mix large style-only edits with unrelated functional changes in the same commit.

---
source: https://google.github.io/styleguide/tsguide.html
