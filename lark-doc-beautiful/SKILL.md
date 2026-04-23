---
name: lark-doc-beautiful
description: Create or improve high-quality Feishu/Lark documents that are visually polished, logically clear, easy for humans to scan, and information-dense. Use when the user asks Codex to write, create, polish, beautify, format, restructure, review, or optimize a Lark/Feishu doc, especially with lark-cli docs v2 XML, DocxXML, docx links, technical explainers, project plans, PRDs, reviews, postmortems, research reports, or long-form knowledge documents.
---

# Lark Doc Beautiful

Use this skill together with `lark-cli docs --api-version v2`. It is a writing and layout harness: first design the reader path, then encode it as DocxXML, then fetch the created document and improve it once.

## Required Inputs

Before writing, infer or ask only if necessary:
- Audience: engineering ICs, tech leads, PMs, executives, or mixed readers.
- Outcome: decision, alignment, learning, action tracking, incident understanding, or reference.
- Source mode: provided material, web research, local code, or pure synthesis.
- Depth: one-page brief, normal doc, or deep dive.

If the user provides example docs, use them to extract reusable patterns only. Do not copy their wording, section order, screenshots, or topic-specific content into the new document unless explicitly asked.

## Workflow

1. Build a reader contract: one sentence for "what the reader should understand after 2 minutes" and one sentence for "what they should do next."
2. Choose a narrative spine:
   - Incident/review: background -> symptom -> diagnosis -> root cause -> fix -> prevention.
   - Technical explainer: why it matters -> mental model -> architecture -> tradeoffs -> playbook.
   - Project/strategy: goal -> current state -> options -> recommendation -> risks -> execution.
   - Research report: conclusion -> evidence map -> competing interpretations -> implications -> references.
3. Draft a block plan before calling `docs +create`: title, opening callout, 4-7 top-level sections, and the non-text block each section will contain.
4. Write DocxXML with `lark-cli docs +create --api-version v2 --doc-format xml --content ...`.
5. Fetch back with `lark-cli docs +fetch --api-version v2 --doc <url> --doc-format xml --detail with-ids --format pretty`.
6. Perform the quality gate below. If the document misses any hard gate, update it before finishing.

## Layout Rules

Use a restrained, technical style. Make the document easy to scan without making it look decorative.

- Start with `<title>` and a short `<callout>` containing the core conclusion, reader payoff, and the most important caveat or action.
- Use `h1`/`h2` hierarchy for document structure. Keep headings short and concrete.
- Avoid more than 3 consecutive plain `<p>` blocks. Convert dense text into `<table>`, `<callout>`, `<grid>`, `<ol>`, `<ul>`, `<checkbox>`, `<pre>`, or `<whiteboard>`.
- Put comparisons, tradeoffs, roles, risks, examples, and implementation steps into tables. Keep tables to 2-4 columns unless the data truly needs more.
- Use callouts for conclusions, warnings, definitions, decision points, and "what this means" summaries. Do not use callouts as decoration.
- Use code blocks only for actual code, pseudo-code, terminal output, data shape, or algorithmic loops. Add a preceding sentence explaining why the code matters.
- Use Mermaid whiteboards only when a diagram improves comprehension: architecture, lifecycle, feedback loop, state machine, data flow, or responsibility split.
- Add an `<hr/>` between major conceptual phases, not between every section.
- End with a practical summary: checklist, playbook, decision table, or next actions.

## Information Design

Write for fast comprehension:
- Lead with answers, then explain. Each section should begin with a conclusion or framing sentence.
- Prefer "concept -> mechanism -> example -> implication" over abstract exposition.
- Use "what changes in practice" tables to translate theory into action.
- Separate facts, interpretation, and recommendations.
- Use absolute dates when discussing time-sensitive events.
- For web-researched docs, cite sources in a final "参考资料" section with link titles and URLs. Do not overquote; summarize in your own words.
- For uncertain claims, say what is inferred and what evidence supports it.

## Quality Gate

A document is not done until it passes:
- First screen has title + high-signal callout or summary.
- The document contains at least 3 block types beyond paragraphs/headings.
- Every top-level section has a clear job and at least one scan-friendly element.
- No section is a wall of prose.
- Key ideas are compressible into a table, checklist, or diagram near the end.
- The final fetch confirms the XML rendered and the main sections are present.
- References are separated from analysis.

## Useful Commands

```bash
lark-cli docs +create --api-version v2 --doc-format xml --parent-position my_library --content '<title>...</title><callout>...</callout>'
lark-cli docs +fetch --api-version v2 --doc "<url-or-token>" --doc-format xml --detail with-ids --format pretty
lark-cli docs +update --api-version v2 --doc "<url-or-token>" --command append --doc-format xml --content '<h1>...</h1>'
```

When the command help or local `lark-doc` skill contradicts this file, follow the installed `lark-doc` skill for exact CLI syntax and this skill for writing quality.
