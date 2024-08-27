# refactor-vir

Making widespread codebase refactors easier.

## Install

```sh
npm i -g refactor-vir
```

It'll work fine if installed locally (instead of globally) as well.

## Commands

### Rename

Renames and/or updates imports for a variable in all found relevant files.

-   Only searches for `.ts` files nested within `src` directories.
-   Ignores all `nodes_modules` directories.
-   Does not handle dynamic `import()` imports yet.

All needed information is prompted from you in your terminal.

```sh
rv rename
```
