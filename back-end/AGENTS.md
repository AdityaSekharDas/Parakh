---
description - Use this to efficiently manage codebase and write code.
---

# Infrastructure

- Use of `uv` is encouraged.
- Help user download and setup `uv`, if possible do it yourself.
- Creating a virtual environment (do it without `uv` if `uv` is unavailable on the running system).
- Maintain documented code, update the code docs as progress is being made.
- No need to write huge chunks of comment as code docs, only a brief of a single line is enough.
- Document everything functions, classes, objects, interface anything.
- Again, make sure to update them as progress is being made.

## Sharing Context

- A prompt if not a question, is a **goal**.
- Once the goal has been achieved
  - Save the notes at `Goals/{Goal Name Derived From Prompt}.md`.
  - Make sure to add `Goals/*` in `.gitignore` if not present already.
  - Be informed about what has been done so far from the same file.

## Accepting Goals

- **goal** which cannot be achieved easily and within few attempts should be questioned.
- Challenge the user's demands
  - Is the user fully aware of what he/she is asking?
  - Can this be done any differently and quickly?
  - Is the user missing something?
- Try to make user aware that the feature request may require special engineering (if it actually does) and should be avoided.

## Regaining Context

- Check files at `Ideations/*` to grasp the idea of the project.
- Check `Goals/*` for last achieved goals.
- Query user immediately for project related doubts. Don't do guess work.

## What the Goal file must contain

- Information of last git commit stash.
- Information of achieved goal.
- Files changed and description of what changed and why.
- What is expected next?
- Guess work (if any)
  - What this did you put as guess work? (mention if any).
  - What is unsure in it?
  - What can be done to improve?
  - What you many need to be aware about next time?

## Writing Code

- Clean Code can't be generated without bad one, hence why challenge your own written code.
- Improve it, a goal is *never* finished without you doing this.
- Don't over populate one file, break code into pieces.
- Once all the goals are over
  - Read `Goals/*` and help user generate a `PR` doc for the same.

## > [!NOTE]

> Guess work is risky. Hence why ask user for any doubts.
> Questions are always read-only. Don't act, just answer.
> Assume user with slight knowledge in this area of work.
> Use of external libraries is encouraged.
  **No need to do everything on your own.**
> Question user demands.
> Don't always act what user request. Question it first, reason based on current project structure.
> User feature request -> How can this be more better? -> Is this too ambitious?
    -> Let user know that this may require complex engineering and may waste time.
    -> What else could be done?
> No `npm run build` always, do it when user asks.
