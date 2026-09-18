---
sidebar_position: 5
title: Contributing
---

# Contributing

The docs are plain Markdown files in the [VAI_worker_docs](https://github.com/jaehoondata/VAI_worker_docs) repository. There are two ways to change them.

## Option 1 — Edit on GitHub (small fixes)

Fastest for a typo or a paragraph or two.

1. Click **"Edit this page"** at the bottom of the page you want to fix.
2. Make your change in the GitHub editor.
3. Click **Commit changes** and choose *Create a new branch and start a pull request*.
4. Give the pull request a one-line title describing what you fixed, and submit it.

## Option 2 — Edit locally (new pages, restructuring)

```bash
git clone https://github.com/jaehoondata/VAI_worker_docs.git
cd VAI_worker_docs
npm install
npm start          # live preview at http://localhost:3000
```

Always work on a new branch.

```bash
git switch -c docs/name-of-your-change
# edit files
git add .
git commit -m "docs: what you added or changed"
git push -u origin docs/name-of-your-change
```

Pushing prints a link you can follow to open the pull request.

## Adding a page

Create a `.md` file in the right folder under `docs/`, with frontmatter at the top.

```markdown
---
sidebar_position: 3
title: Title shown in the sidebar
---

# Page title

Body...
```

The sidebar is generated from the folder structure, so there is nothing to register. Use `sidebar_position` to order pages within a folder, and the folder's `_category_.json` to rename or reorder the folder itself.

## Translations

Korean is the default language. To translate a page into English, create it at the same path under `i18n/en/docusaurus-plugin-content-docs/current/`. For example, the English version of `docs/ai-worker/setup.md` lives at `i18n/en/docusaurus-plugin-content-docs/current/ai-worker/setup.md`.

Pages without a translation fall back to the Korean original on the English site, so you can translate the important ones first and leave the rest.

## Writing conventions

- Keep titles short and noun-like (`Development environment setup`, not `How to set up your development environment`)
- Commands go in code blocks; explanation goes outside them
- Put screenshots in `static/img/` and reference them as `![description](/img/filename.png)`
- Mark values that differ per person (paths, IPs, accounts) with angle brackets, like `<username>`
