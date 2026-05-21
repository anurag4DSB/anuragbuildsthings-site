# Prompts I Keep Coming Back To

prompts

claude-code

ai-coding

living-document

A commonplace book - prompts and magic words I’ve collected from others and keep reaching for. Not mine; just my favorites. Growing as I find more.

Published

21 May 2026

> **NOTE:**
>
> **Living document - last updated 2026-05-21.** Started today. I add to this when a prompt earns its place.

## What this is

A commonplace book of prompts.

Not prompts I wrote - prompts I’ve come across in other people’s posts, threads, repos, and talks, and found myself reaching for over and over. The kind that earn a spot in muscle memory because they keep producing useful output for the work I actually do.

This page exists for one reason: I kept losing them. See a great prompt, use it once, need it again a month later, reconstruct it badly from memory. From now on, when one earns its third use, it lives here.

Where I know the source, I credit it. Where I don’t, the source line stays open until I rediscover it. Each entry is just the prompt itself - copy-pasteable - and, when it helps, a short note on why I like it.

## Quick reference

| Prompt | What it’s for | Section |
|----|----|----|
| [ultrathink](#ultrathink) | Trigger deeper reasoning from Claude | Magic words |
| [diary](#diary) | Surface step-by-step reasoning instead of compressed summary | Magic words |
| [great textbook](#great-textbook) | Counter GPT-5’s tendency to be cryptic | Magic words |
| [BURN THE BOATS](#burn-the-boats) | Stop agents from doing unnecessary backward-compat work | Magic words |
| [Project kickoff interview](#project-kickoff-interview) | Get past surface requirements at the start of a project | Full prompts |

## Magic words

Short phrases I drop into prompts to nudge model behavior. From a friend at DeepMind: *reasoning models aren’t only better because they “reason” - they’re also better because outputting more tokens means more compute budget*. So anything that makes a model think longer or output more helps, to a degree. These are user-triggered versions of that effect.

### ultrathink

A trigger for deeper reasoning. Drop it into any Claude prompt where you want expanded thinking - Claude treats it as a signal to spend more compute budget on the response.

    plan this refactor - ultrathink

### diary

Forces step-by-step thinking. Makes uncertainty explicit. Prevents the model from collapsing everything into a dense summary.

Instead of jumping straight to a compressed explanation, the model has to walk through how understanding evolved over time: observations, hypotheses, dead ends, and conclusions. A side effect I’ve noticed: the reasoning trace also surfaces loopholes in conclusions before reaching them.

    explain this bug as a diary entry

### great textbook

For countering GPT-5’s tendency to be cryptic. Forces pedagogical, clear, build-up-understanding-from-zero explanations instead of dense compressed summaries.

I discovered this one going through a bug. The agent’s summary was technically correct but unreadable. The reframing produced a clean walk-through I could actually hand to a teammate.

    write an explanation of this bug, like a great textbook

### BURN THE BOATS

For when agents do unnecessary backward-compatibility work. Drops the legacy-preservation instinct and lets the model rewrite freely.

    refactor this module - BURN THE BOATS

I’ve used it four or five times in 2025. Works every time.

## Full prompts

### Project kickoff interview

    I am about to start this project, "PROJECT NAME". You have all the
    context using the hopocalypse MCP server. Interview me until you have
    95% confidence about what I actually want, not what I think I should
    want.

The load-bearing line is *“what I actually want, not what I think I should want.”* Without it, the model interviews for surface requirements I’ve already articulated. With it, the interview interrogates the framing I came in with - which is usually where the assumptions are hiding.

The MCP reference is incidental - swap in whatever your context-loading mechanism is, or drop the line entirely. The interviewing pattern is the part that matters.

## On my radar

Half-remembered prompts I want to write up next. Placeholders until they get full entries above.

- **`yaml dsl`** - a structural framing trick I keep using; need to articulate the load-bearing parts.
- **`for a new intern`** - a thoroughness trigger; need to write up when it does and doesn’t help.

## How I add to this

A prompt earns a spot here after three uses and after I can articulate (even in one line) what makes it land. Until then it lives in *On my radar* above as a name, a thread link, or a vague memory of a phrase that worked.
