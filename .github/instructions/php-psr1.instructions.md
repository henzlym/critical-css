---
description: "Concise, model-focused summary of PSR-1 (Basic PHP Coding Standard)."
applyTo: '**/*.php'
---

**PHP Tags & Encoding**
- Use the full opening tag `<?php` only; do not use the closing `?>` in pure PHP files.
- Files MUST be encoded in UTF-8 without BOM.
- Do not use short tags (`<?`) or ASP-style tags.

**Side Effects**
- A file SHOULD either declare symbols (classes, functions, constants) or cause side effects (execute code, output, send headers), but not both.
- Keep side-effecting code in entry-point scripts; keep reusable declarations in separate files.

**Namespaces & Class Names**
- Use namespaces when appropriate; prefer one logical namespace per file.
- Class, interface and trait names MUST use StudlyCaps (e.g., `MyService`, `UserRepository`).

**Constants/Properties/Methods**
- Class constants SHOULD be all upper case with underscore separators: `const STATUS_OK = 1;`
- Method names MUST be declared in camelCase: `public function getUser(): User`
- Property names SHOULD use camelCase: `private int $createdAt;`

**Examples**
- Declaration file (no closing tag):
```php
<?php
namespace App\Models;

class User
{
    public const STATUS_ACTIVE = 1;

    private string $name;

    public function getName(): string
    {
        return $this->name;
    }
}
```
- Side-effect (entry) file:
```php
<?php
// entry.php — side effects only
echo json_encode(['status' => 'ok']);
```

**Links**
- PSR-1 (official): https://www.php-fig.org/psr/psr-1/
- PSR-1 (GitHub mirror): https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-1-basic-coding-standard.md

source: https://raw.githubusercontent.com/php-fig/fig-standards/master/accepted/PSR-1-basic-coding-standard.md
