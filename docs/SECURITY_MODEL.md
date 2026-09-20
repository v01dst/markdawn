# Security model

markdawn is designed to turn untrusted Markdown into HTML, so the safety boundary is the renderer's most important contract.

## Default behavior

Sanitization is enabled by default. Dangerous elements and attributes must not become executable HTML, while ordinary formatting remains usable.

Important cases include script and iframe elements, event-handler attributes, javascript-style URLs, and raw HTML that is intentionally allowed by the sanitizer.

## API contract

The safe option controls the documented safety behavior. Any change to sanitization rules should include regression tests for both dangerous input and legitimate formatting.

## Deployment note

Sanitization reduces XSS risk in rendered output; it does not make arbitrary application code or surrounding infrastructure safe. Consumers should still apply normal HTTP, authentication, CSP, and content-security controls.
