# Parakh

Parakh is a hackathon project (ITER SIH 2026) that lets citizens report service issues, track alerts and pay for services, while giving operators a dashboard to review requests, see an overview of activity and analyse the data.

## Repository Structure

```
Parakh/
├── front-end/   Next.js user interface (React, TypeScript, Tailwind)
└── back-end/    API layer (not implemented yet)
```

## Team Help Guide - GitHub CLI

This guide covers everything a team member needs to contribute, using the GitHub CLI (`gh`). You do not need to know git for forking, cloning or pull requests - `gh` handles that. The only git commands needed are for saving your changes locally before you open a pull request.

### 1. Install GitHub CLI

**Windows**

Open PowerShell and run:

```powershell
winget install --id GitHub.cli
```

Restart your terminal after the install finishes. Alternatively, download the MSI installer from https://cli.github.com and run it.

**macOS**

Install with Homebrew:

```bash
brew install gh
```

**Linux (Debian / Ubuntu)**

```bash
sudo mkdir -p -d /etc/apt/keyrings
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null
sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Linux (Fedora / RHEL)**

```bash
sudo dnf install gh
```

**Linux (via Homebrew)**

If you prefer Homebrew on any Linux distribution:

```bash
brew install gh
```

Check the install worked by running `gh --version` in any terminal.

### 2. Log in to GitHub

```bash
gh auth login
```

Pick GitHub.com, choose HTTPS, and when asked for authentication prefer logging in with a web browser. A browser window opens and asks you to authorize the GitHub CLI. Follow the on-screen prompts until it says you are logged in.

### 3. Fork the repository

A fork is a copy of the original repository under your own GitHub account. You never push to the original repo directly - you push to your fork and ask the original to pull your changes.

```bash
gh repo fork OWNER/Parakh --clone
```

Replace `OWNER` with the GitHub username of the person who owns the repository. This command creates the fork on GitHub and clones your copy to your machine at the same time. The original repo is added as a remote called `upstream` and your fork as `origin`.

If you already cloned the repo with a tool and only need to set up your fork, run this inside the repo folder:

```bash
gh repo fork --remote
```

### 4. Write your code

Never work directly on the main branch. Create your own branch so your work stays separate:

```bash
git switch -c <branch-name>
```

Use a name that describes what you are working on, for example `feature/login-page` or `fix/payment-api`.

Make your changes in the `front-end/` or `back-end/` folders. You can see what you changed at any time with:

```bash
git status
```

### 5. Save your changes locally

```bash
git add .
git commit -m "short description of what you changed"
```

`git add .` stages every changed file. `git commit` saves them locally on your branch. Keep the message short and describe the change, for example `add login page validation`.

### 6. Send a pull request

Push your branch to your fork:

```bash
git push -u origin <branch-name>
```

Then create the pull request against the original repository:

```bash
gh pr create
```

`gh` opens the pull request form in your browser. Copy the template below into the description box, fill it in and submit. One of the team leads will review it and merge it into the original repository.

#### PR description template

```markdown
## Summary

One or two sentences on what this PR does and why.

## Changes

- Changed ...
- Added ...
- Fixed ...

## How to Test

1. Run `pnpm dev` in `front-end/`
2. Open http://localhost:3000
3. Confirm ...

## Screenshots

(Add before/after screenshots here if the PR changes the UI.)

## Checklist

- [ ] Code runs without errors
- [ ] Tested the change manually
- [ ] No unrelated files changed

Closes #
```

#### Writing a proper PR description

The description is what reviewers and judges read first - a messy description means a messy review. Keep the title short and specific (for example `add login page validation` or `fix payment timeout bug`), and structure the description in Markdown:

- Use `##` headings to split the description into sections
- Use bullet lists (`- `) for changes and test steps
- Use `1. 2. 3.` numbered lists for ordered steps
- Wrap file paths, commands and code in backticks (`` ` ``)
- Drag and drop screenshots directly into the description box
- Write `Closes #<issue-number>` on its own line to auto-close the issue it fixes
- Mention a teammate in the description with `@username` if their input is needed

### 7. Keep your fork and clone up to date

The main branch of the original repo moves as pull requests get merged. Sync before starting new work:

```bash
gh repo sync
```

This updates both your local main branch and your fork on GitHub. Switch back to main first with `git switch main` if you are on a feature branch.
