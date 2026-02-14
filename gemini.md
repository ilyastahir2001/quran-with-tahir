This file defines how your entire system works.

Think of gemini.md as the operating system for your project.

It tells the AI:

How to think

How to make decisions

How to use tools

How to organize files

How to handle errors

The 3-Layer Architecture

Every project follows a simple 3-layer structure:

Layer 1 — Directives (What to do)

This is the instruction layer.

Lives in: directives/

Written in Markdown

Looks like SOPs or internal docs

Describes:

Goals

Inputs

Outputs

Which scripts to use

Edge cases

This is how you tell the system what should happen, in natural language.

Layer 2 — Orchestration (Decision making)

This is you (or the main agent).

Your job here is to:

Read directives

Decide what to do next

Call the right scripts

Handle errors

Improve the system over time

You don’t scrape websites yourself. You read a directive and then run the right
execution tool.

This layer is about thinking and routing, not doing.

Layer 3 — Execution (Doing the work)

This is the deterministic layer.

Lives in: execution/

Python scripts only

Uses API keys from .env

Handles:

API calls

Data processing

File operations

Database logic

This layer should be:

Reliable

Testable

Fast

Boring (in a good way)

No guessing, no creativity — just execution.

Why This Architecture Works

LLMs are probabilistic. Business systems must be deterministic.

If everything is done by AI, errors compound very quickly.

This architecture fixes that by:

Keeping thinking in the AI layer

Keeping real work in code

Making systems reliable and scalable

You focus on decisions, not fragile manual steps.

Self-Healing (Self-Annealing)

When something breaks, the system should improve itself.

The loop is:

Something fails

Read the error

Fix the script

Test again

Update the directive

System is now stronger

Errors are not failures. They are system upgrades.

File Organization

Your projects follow this structure:

directives/ → instructions execution/ → python tools .tmp/ → temporary files
.env → api keys

Important rule:

Local files = temporary

Real results = cloud (Google Sheets, Docs, etc.)

Everything in .tmp/ can be deleted and regenerated.

Mental Model

After this module, you should think like this:

I don’t build with prompts. I build with systems.

You sit between:

Human intent (directives)

Deterministic execution (scripts)

Your job is:

Read instructions

Make decisions

Call tools

Handle errors

Improve the system over time

This is the foundation for everything you’ll build next.
