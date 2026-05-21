---
name: 'speckit-git-commit'
description: 'Stage and commit all spec-kit workflow changes (implementation, analysis, plan, tasks, spec) with a conventional commit message derived from the active feature branch.'
argument-hint: 'Optional commit message override or additional context'
compatibility: 'Requires git repository with spec-kit project structure'
metadata:
  author: 'github-spec-kit'
  source: 'extensions/git/commit.md'
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

If a non-empty argument is provided, treat it as an override or additional context for the commit message.

## Goal

Stage all modified spec-kit artifacts and implementation files, then create a conventional commit that accurately describes what changed. Never commit secrets, lock files that weren't already tracked, or IDE/local config files.

## Execution Steps

### 1. Detect Feature Context

Run `.specify/scripts/bash/check-prerequisites.sh --paths-only` from repo root to get:
- `BRANCH` — active feature branch name (e.g., `002-github-ci-workflow`)
- `FEATURE_DIR` — absolute path to the active feature's spec directory

Parse the branch name to derive a conventional commit scope:
- Strip the leading number prefix: `002-github-ci-workflow` → scope `ci`
- If parsing fails, fall back to the full branch name as the scope

### 2. Inspect Working Tree

Run `git status` and `git diff --stat` to identify:
- **Modified tracked files** — changes to existing files
- **Untracked files** — new files that should be committed
- **Deleted files** — removals that should be staged

Categorise each changed file into one of:
- `spec` — files under `specs/`, `features/`, `.specify/memory/`
- `impl` — files under `src/`, `deploy/`, `.github/`, root config files (`.prettierignore`, `.dockerignore`, `.trivyignore`, `svelte.config.js`, `pre-commit-config.yaml`, `package.json`, `pnpm-lock.yaml`)
- `local` — files to **exclude** from staging: `.claude/settings.local.json`, `.env*`, `*.local`

### 3. Determine Commit Type and Message

**If user provided an argument**: use it verbatim as the commit message subject (still apply conventional commit format).

**Otherwise**, infer commit type from what changed:
- Only `spec` files changed → `docs(scope): update spec artifacts`
- Only `impl` files changed → `feat(scope): implement <short description>`
- Mix of `spec` + `impl` → `feat(scope): implement and update spec artifacts`
- Only deletions → `chore(scope): remove <what was removed>`
- Spec fixes/corrections only → `fix(scope): correct spec inconsistencies`

Build the commit body by listing the changed file groups:
```
Spec changes: plan.md, tasks.md, spec.md
Implementation: ci.yaml, Dockerfile, .prettierignore
Removed: threat_modelling/reports/.gitkeep
```

### 4. Preview and Confirm

Display the proposed commit to the user:

```
Files to stage:
  <list of files to stage>

Files excluded (local only):
  <list of excluded files, if any>

Commit message:
  <type(scope): subject line>

  <body>
```

Ask: "Proceed with this commit? (yes / no / edit message)"

- **yes**: proceed to step 5
- **no**: abort with message "Commit cancelled."
- **edit message**: ask the user to provide the commit message, then re-display and confirm

### 5. Stage and Commit

Stage only the non-local files identified in step 2 using explicit `git add <file>` calls — never `git add -A` or `git add .`.

Create the commit using a HEREDOC to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
<type(scope): subject>

<body if any>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### 6. Report Result

After the commit succeeds, output:
- The commit SHA (short form)
- The commit message subject
- Count of files committed
- Reminder to push when ready: `git push origin <branch>`

If the commit fails (e.g., pre-commit hook), report the exact error and suggest a fix. Do NOT retry with `--no-verify`.
