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
   - Article/deep-dive explainer: source/context -> one-sentence thesis -> structure map -> decision diagram -> terminology -> section-by-section explanation -> final compression.
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
- Use `<grid>` as a first-class layout tool, especially for side-by-side screenshots, before/after states, parallel options, and step-by-step visual walkthroughs.
- Use code blocks only for actual code, pseudo-code, terminal output, data shape, or algorithmic loops. Add a preceding sentence explaining why the code matters.
- Use Mermaid whiteboards only when a diagram improves comprehension: architecture, lifecycle, feedback loop, state machine, data flow, or responsibility split.
- Add an `<hr/>` between major conceptual phases, not between every section.
- End with a practical summary: checklist, playbook, decision table, or next actions.

## Grid / Column Layout

Use columns deliberately. A good grid reduces scrolling, makes comparison instant, and turns visual procedures into a scannable strip.

Prefer these patterns:
- 2 columns (`0.5 / 0.5`): before vs after, PC vs mobile, policy vs exception, problem vs solution, two screenshots that should be compared.
- 3 columns (`0.333 / 0.333 / 0.333`): three states in one flow, three decision branches, three role responsibilities, compact screenshot sequences.
- 4 columns (`0.25` each): mobile app walkthrough screenshots where each image is narrow and the reader benefits from seeing the whole sequence at once.
- 5 columns only for very narrow phone screenshots or notification examples; otherwise it becomes cramped.

Rules for image grids:
- Put one short sentence before the grid explaining what the reader should compare or notice.
- Use equal column ratios for equivalent items. Use unequal ratios only when one column is explanatory text and the other is visual evidence.
- Keep images in the same grid visually homogeneous: same product surface, similar crop, similar scale, same phase of the workflow.
- For procedural docs, put the step text immediately before the grid, then the screenshots. Do not bury instructions inside image captions.
- Use callouts before or after grids for exceptions, warnings, or policy notes that affect the step.
- Do not place long prose inside a column next to tall screenshots; it creates uneven scan paths. Use bullets or a small table instead.

Example:

```xml
<p>Compare the entry screen and confirmation screen before booking.</p>
<grid>
  <column width-ratio="0.5"><img href="..." name="entry.png"/></column>
  <column width-ratio="0.5"><img href="..." name="confirm.png"/></column>
</grid>
```

For text-only grids, each column must have a heading and a compact list. If the content needs more than 5 bullets per column, use a table or separate sections instead.

## Explainer Pattern

For long-form explainers, paper/article breakdowns, concept tutorials, and "深入浅出" style documents, front-load navigation before detail:

- If based on a source article, start with a source callout: original link, author, publish date, and why the source matters.
- Add a reading-guide callout before the main body: who should read it, the single most important section, and the one idea to remember if the reader is short on time.
- Add a one-sentence thesis callout. Make it opinionated and memorable.
- Add a structure map table with columns like `#`, `section`, `core question`, or `takeaway`.
- Add a decision tree or mental-model diagram near the top when the doc teaches a framework. This lets readers get the whole argument before reading details.
- Add a terminology table before dense sections. Include a plain definition and a daily-life analogy for each term.
- Choose one recurring metaphor and reuse it across sections to reduce cognitive load. Keep it accurate and do not force it where it does not fit.

Use this per-section rhythm for difficult concepts:

1. State "what this section is about" in one sentence.
2. Explain the mechanism.
3. Give a concrete failure/success scenario with enough detail that the reader can picture it.
4. Compress the lesson into a table or diagram.
5. Close with a core-insight callout.

For decision-framework docs, include:
- Default stance: what to do before adding complexity.
- Trigger signals: measurable symptoms that justify changing approach.
- First-line remedies: simpler fixes to try before architecture changes.
- Upgrade criteria: when the heavier approach is justified.
- Failure modes: how the recommended approach can still go wrong.
- Final mantra: one sentence that governs future decisions.

## Information Design

Write for fast comprehension:
- Lead with answers, then explain. Each section should begin with a conclusion or framing sentence.
- Prefer "concept -> mechanism -> example -> implication" over abstract exposition.
- Use "what changes in practice" tables to translate theory into action.
- Separate facts, interpretation, and recommendations.
- Turn abstract principles into operational tests: "what signal proves this?", "what cheaper remedy should be tried first?", "what failure mode should be guarded against?"
- Use analogies only when they clarify a technical boundary. Pair analogy with the precise technical definition so the analogy does not become the argument.
- Use absolute dates when discussing time-sensitive events.
- For web-researched docs, cite sources in a final "参考资料" section with link titles and URLs. Do not overquote; summarize in your own words.
- For uncertain claims, say what is inferred and what evidence supports it.

## Quality Gate

A document is not done until it passes:
- First screen has title + high-signal callout or summary.
- The document contains at least 3 block types beyond paragraphs/headings.
- If the document contains multiple screenshots, related images are grouped into `<grid>` blocks rather than stacked one by one.
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
