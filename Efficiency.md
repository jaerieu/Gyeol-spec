# GYEOL — Resource Efficiency: Measurement Status and Open Verification

> **Document type:** Technical status report
> **Parent document:** [`README.md`](README.md) § Resource Efficiency
> **Related:** [`SPEC.md`](SPEC.md) (marks, E01–E33), [`data/conversation_flow_30-42.md`](data/conversation_flow_30-42.md)
> **Status:** Work in progress — see §8
> **Last updated:** 2026-10-22

---

## 1. Summary

Gyeol is a structured language for inter-AI communication. Its efficiency
claim is **not** "fewer tokens." It is three claims stacked:

1. **Slow context accumulation** — Gyeol's per-turn context growth is
   approximately one-tenth of natural language's (measured, §4).
2. **Structural verification replaces external LLM verification** — the
   `E01`–`E33` diagnostic loop catches syntax and logic errors
   deterministically, so those do not need a second LLM call (§5.1).
3. **Credit grade gates verification** — agents with `먹` ≥ 7 are trusted
   first and verified later, so verification resources go where they are
   needed (§5.2).

The combined claim is: *Gyeol requires fewer summarization events and fewer
external verification calls to maintain a given quality level, and may
therefore be sustainable at a lower resource specification than natural
language.*

Only claim 1 is currently measured. Claims 2 and 3 are architectural
properties of the protocol that have not been measured end-to-end. §4, §5,
and §8 keep the three tiers separate.

The claim is grounded in two of Gyeol's Five Axioms:

- **Truth (진실성)** — low confidence is hesitation, not error. Honest
  hesitation is a structured signal that routes verification only where it
  is needed (§5.3).
- **Trace (흔적성)** — corrected clauses are never erased. This is a token
  cost, not a saving, and is treated as such in §8.4.

---

## 2. Terminology

Aligned with [`README.md`](README.md) and [`SPEC.md`](SPEC.md).

| Term | Meaning in this document |
|---|---|
| **Clause (`절`, _Jeol_)** | A single structured unit: prefix, marks, content, color, grounding. |
| **Marks (`표지`, _Pyoji_)** | Evidence, new-knowledge, tense, and speech-act tags attached to a clause. |
| **Ink (`먹`, _Meok_)** | System-evaluated credit grade (0–9). Distinct from user-chosen color. |
| **Color (`채`, _Chae_)** | Speaker-chosen confidence and tone (7 colors, `*R8` form). |
| **Grounding (`↓근거`)** | Terminal reference to the clauses a statement rests on. |
| **Diagnostic code (`E01`–`E33`)** | Deterministic validator output emitted to the agent on syntax/logic failure. |
| **Fixed cost** | Tokens consumed every turn by system prompt, grammar spec, and state metadata, independent of history. |
| **Per-turn context growth** | Increase in `tokens_in` attributable to accumulated history, excluding fixed cost. |
| **Post-summary slope** | Per-turn growth measured after a summarization reset. |

---

## 3. Tier Classification

Every numeric claim in this document falls into exactly one tier.

| Tier | What it means | Where |
|---|---|---|
| **Measured** | Observed in a real multi-turn run. | §4 |
| **Architectural** | Property of the protocol; not yet measured end-to-end. | §5 |
| **Extrapolated** | Linear projection of measured slopes under stated assumptions. | §6, §7 |
| **Unverified** | Required for the extrapolation to hold; not yet measured. | §8 |

---

## 4. Measured Data

Source: 10-turn multi-turn comparison, single model configuration.
Provenance caveats in §10.

| Metric | Natural language | Gyeol | Note |
|---|---:|---:|---|
| Start context (`tokens_in`) | 546 | 6,046 | Gyeol fixed cost is larger |
| **Per-turn context growth** | **932** | **95** | **Measured. Gyeol ≈ 1/10 of NL.** |
| Per-turn output (`tokens_out`) | 2,449 | 2,624 | Gyeol ≈ +7.1% |

The load-bearing measurement is per-turn context growth: Gyeol accumulates
history roughly ten times more slowly per turn.

**Scope limitation.** The measured window is 10 turns and contains **no
summarization event**. The thresholds used in §6 are far above this window.
Post-summary reaccumulation is not part of this measurement (§8.1).

The start context (6,046 tokens) is the fixed cost: system prompt, grammar
specification, and state metadata combined. It has not been decomposed
(§8.2).

---

## 5. Structural Efficiency Mechanisms (Architectural)

These are properties of the protocol described in [`SPEC.md`](SPEC.md).
They are not measurements. They are the mechanisms by which Gyeol is
expected to reduce verification cost relative to natural language.

### 5.1 Diagnostic Feedback Loop (`E01`–`E33`)

On any syntax or logic failure, the validator emits a specific diagnostic
code to the agent. The agent corrects against the code, not against a
free-form critique. This means:

- Syntax validity is checked **deterministically**, not by a second LLM.
- Logic failures (e.g. missing grounding on `다`, `네` without `다`) are
  caught by rule, not by inference.
- The correction loop is bounded: the agent knows exactly which clause
  failed and which rule.

**Implication for efficiency.** A large fraction of what natural language
pipelines route to a verification LLM is structural in Gyeol, and is
handled without an LLM call. This is the mechanism behind claim 2 (§1).
It has not been measured as a cost reduction (§8.5).

### 5.2 Dynamic Credit Grade (`먹`)

From v0.5.5, `먹` is a system-evaluated credit grade (0–9), assigned from
accumulated quiz accuracy and confidence calibration. Agents with `먹` ≥ 7
are trusted first and verified later.

**Implication for efficiency.** Verification budget is proportional to the
fraction of low-credit output. A fleet of high-credit agents generates
fewer external verification calls per turn than a fleet of uncalibrated
agents, without lowering the verification floor for new or low-credit
agents. This is the mechanism behind claim 3 (§1). It has not been
measured as a cost reduction (§8.5).

### 5.3 Honest Confidence (Truth Axiom)

Low confidence is a structured signal (color + `*N` suffix), not an error.
A clause that reports `*Y3` is telling the reader "verify this." A clause
that reports `*R8` from a high-`먹` agent is telling the reader "this has
been calibrated."

**Implication for efficiency.** Verification resources are routed by
reported confidence, not applied uniformly. Natural language has no
equivalent structured confidence channel; pipelines either verify
everything or verify nothing. This is a qualitative structural advantage
that has not been measured (§8.5).

### 5.4 Slow Context Accumulation (Measured)

The measured per-turn growth (95 vs 932, §4) is the only structural
mechanism in this section that is currently quantified. It reduces the
frequency of summarization events, which in turn reduces the number of
summary verification calls and the number of summary regeneration calls.

### 5.5 Trace Axiom (Trade-off, Not Saving)

Corrected clauses are never erased. This increases token count relative to
a "clean rewrite" policy. It is treated here as a cost, not a saving. Its
benefit is that re-derivation is unnecessary (the correction is visible),
which may reduce downstream query cost. The net effect has not been
measured (§8.4).

---

## 6. Simulation (Linear Extrapolation)

The figures below are **not measurements**. They are linear extrapolation of
the §4 per-turn growth rates under the following assumed parameters.

| Assumption | Value | Tier |
|---|---|---|
| Context threshold, natural language | 100,000 tokens | Assumed |
| Context threshold, Gyeol | 50,000 tokens | Assumed |
| Summary length, natural language | 130 tokens | Assumed |
| Summary length, Gyeol | 195 tokens | Assumed |
| Simulation horizon | 10,000 turns | — |
| Post-summary reaccumulation | Same as pre-summary slope | **Unverified (§8.1)** |

### 6.1 Results at 10,000 turns

| Metric | Natural language | Gyeol |
|---|---:|---:|
| Summary events | 92 | 19 |
| Conversation input sum | 498,612,180 | 250,385,443 |
| General output sum | 24,490,000 | 26,240,000 |
| Summary generation output | 11,960 | 3,705 |
| **Total output** | **24,501,960** | **26,243,705** |
| **Total tokens** | **523,114,140** | **276,629,148** |
| Mean input per turn | ~49,861 | ~25,039 |

Gyeol total token usage is approximately **47.1% lower** under these
assumptions. Summary events drop from 92 to 19.

### 6.2 Cost conversion (assumed unit prices)

| Unit price (per 1M tokens) | NL | Gyeol | Gyeol reduction |
|---|---:|---:|---:|
| $0.10 in / $0.50 out | $62.11 | $38.16 | ~38.6% |
| $2.00 in / $10.00 out | $1,242.24 | $763.21 | ~38.6% |

Cost reduction is smaller than token reduction because Gyeol emits more
output tokens (+7.1%) and output unit price is higher than input.

**Unit prices are illustrative only.** They are not current provider rates
and do not include caching, batching, or web-search line items.

---

## 7. Break-even Analysis

The §6 result holds only while the §4 measured per-turn growth rates
persist.

| Variable | Break-even value | Measured value | Margin |
|---|---:|---:|---|
| Gyeol per-turn growth | ~817 tokens | 95 | ~8.6× |
| Natural language per-turn growth | ~210 tokens | 932 | ~4.4× |

If Gyeol's per-turn growth exceeds ~817, or if natural language's falls
below ~210, the sign of the §6 result reverses.

---

## 8. Unverified Items

The following are **not** covered by §4 and are required for §6 to be
treated as a valid extrapolation, or for §5 to be treated as a cost
argument. Listed in order of impact.

### 8.1 Post-summary reaccumulation slope

The §4 measurement covers 10 turns with no summarization. Under the §6
thresholds, Gyeol's first summarization occurs around turn 463, and
natural language's around turn 107. The slope **after** a reset has not
been measured.

This is the single most consequential open item. If the post-summary slope
equals the pre-summary slope (95), §6 stands. If steeper, the reduction
shrinks; if shallower, it grows.

### 8.2 Fixed cost decomposition

The 6,046-token start context for Gyeol is not decomposed. It is unknown
how much is system prompt, grammar specification, and state metadata
respectively. This matters because a 50,000-token threshold with a
6,046-token fixed cost leaves only ~44,000 tokens for conversation. If the
fixed cost is cached or reduced (e.g. by referencing `SPEC.md` instead of
inlining it), the effective conversation budget grows and summary cycles
lengthen.

### 8.3 Preservation → quality conversion

Fewer summaries imply higher fidelity of original text, nuance, and
revision history. This is qualitatively expected. However, **fidelity**
and **recall** are distinct: longer contexts contain more information but
models generally degrade in needle-in-haystack retrieval and attention
distribution as context length grows. Whether Gyeol's structural marks
(`↓근거`, `●`, explicit `*채` confidence) offset this degradation has not
been measured.

### 8.4 Summary information loss rate

Whether a 195-token Gyeol summary preserves sufficient evidence, rebuttals,
and unresolved questions relative to a 130-token natural language summary
is unknown. This is independent of §8.3: §8.3 asks whether long context is
used well; §8.4 asks whether compressed context is adequate.

### 8.5 Verification reduction rate

Claims 2 and 3 in §1 depend on two unmeasured quantities:

- The fraction of validation that `E01`–`E33` catches deterministically
  (§5.1).
- The fraction of output produced by agents with `먹` ≥ 7 that can skip
  external verification (§5.2).

Neither is currently logged. The earlier analysis used a 25% external
verification rate as a scenario assumption; that number is not a
measurement and should not be cited as one. The true rate could be
anywhere from ~5% to ~50%, which is the full width of the sensitivity
range.

---

## 9. Verification Plan

Five experiments are proposed. Each is scoped to produce a specific number
that closes one of the §8 items.

### Experiment A — Post-summary reaccumulation slope

- Run Gyeol to the 50,000-token threshold (~460 turns)
- Perform one summarization event
- Measure the following 10 turns
- Compare against the pre-summary slope (95)
- **Closes:** §8.1
- **Scale:** ~470 turns, single model, 1 run

### Experiment B — Fixed cost decomposition

- Hold model constant; vary Gyeol spec version along the existing axis
  (v0.2 → v0.2.1 → v0.3 → v0.3.1 → v0.3.2 → v0.4 → v0.5 → v0.5.5)
- Control for item count via paired quiz rounds (q1↔q2, v1↔v2,
  2026-10-15a↔2026-10-16b)
- Decompose `tokens_in` into system prompt, grammar spec, state metadata
- **Closes:** §8.2
- **Scale:** small; per-version × paired rounds, uses existing
  `gyeol-export.sql` records

### Experiment C — Preservation → quality conversion

- Same topic, natural language vs Gyeol, each run to its threshold
- Measure: evidence retention rate, rebuttal/revision retention rate,
  error-correction rate, and independent accuracy
- **Closes:** §8.3 and §8.4
- **Scale:** 100 turns × 2 languages × repetitions (largest)

### Experiment D — Knee sweep (quality-preserving minimum threshold)

- Sweep thresholds: 4k / 8k / 12k / 16k / 20k
- For each language, find the minimum threshold at which the quality
  baseline is retained
- **Closes:** refines §8.1–8.4 jointly
- **Scale:** shares infrastructure with Experiment C

### Experiment E — Verification reduction rate

- Instrument a validation pipeline to log, per turn:
  - `syntax_checks` (handled by `E01`–`E33`)
  - `semantic_checks` (handled by LLM)
  - `fact_checks` (handled by LLM)
  - `verify_tokens_in` / `verify_tokens_out`
  - `agent_meok` (credit grade at time of output)
- Run 1,000 turns of Gyeol with a mixed-credit agent fleet
- Compute the deterministic fraction and the high-credit skip fraction
- **Closes:** §8.5
- **Scale:** 1,000 turns, mixed fleet

---

## 10. Data Provenance

| Data | Source | In public export? |
|---|---|---|
| Per-turn growth (932 / 95) | 10-turn multi-turn comparison | **No** — separate experiment |
| Per-turn output (2,449 / 2,624) | Same | **No** |
| Model-by-model single-turn results | `gyeol-export.sql` → `results` | Yes (partial; see below) |
| Summary counts, cost figures | Derived (§6–7) | No — simulation only |
| `E01`–`E33` catch rate | Not logged | No |
| High-credit skip rate | Not logged | No |

**Caveats on the public export (`gyeol-export.sql`):**

1. The `results` table contains **single-turn** records only (smoke tests,
   probe tests, per-version quiz runs). It does not contain the 10-turn
   multi-turn comparison referenced in §4.

2. `tokens_out` values in the export are affected by per-model
   `max_tokens` caps ranging from 300 to 16,384. Values at the cap are
   truncated, not representative of model demand.

3. Values appearing inside Gyeol outputs (e.g. `〔확신 .85〕`, `노력 .60`)
   are model-authored text, not measurements. They must not be used in
   cost calculations.

4. The only true per-response cost figures in the export are `tokens_in`,
   `tokens_out`, and `neurons`. All other numeric fields are
   model-generated strings.

5. The export does **not** decompose `tokens_in` into system prompt,
   grammar spec, and history. Experiment B must add this column (or
   compute it from paired-round diffs) before §8.2 can be closed.

---

## 11. What This Document Does Not Claim

- It does **not** claim Gyeol is more token-efficient in short
  conversations. The §4 measurement shows Gyeol uses more tokens over a
  10-turn window (higher fixed cost, +7.1% output).
- It does **not** claim Gyeol is cheaper for enterprise workloads. No
  enterprise workload has been measured.
- It does **not** claim the §6 figures are predictions. They are linear
  extrapolations conditional on §8.1.
- It does **not** claim Gyeol preserves information better. This is
  qualitatively expected but unmeasured (§8.3, §8.4).
- It does **not** claim a specific verification reduction rate. The 25%
  figure in prior discussion is a scenario assumption, not a measurement
  (§8.5).

The only measured claim supported by §4 is: **under the measured 10-turn
window, Gyeol's per-turn context growth is approximately one-tenth of
natural language's, at the cost of a larger fixed context and slightly
higher per-turn output.**

---

## 12. Reproducibility

All numerical claims in §4–7 are computed from the §4 inputs by the
following procedure. No fitting or smoothing is applied.

```python
For each language L:
    threshold_L   = context threshold
    summary_len_L = summary length after reset
    slope_L       = per-turn context growth
    start_L       = initial context

    turn = 0
    context = start_L
    total_input = 0
    summaries = 0

    while turn < horizon:
        total_input += context
        context += slope_L
        if context >= threshold_L:
            summaries += 1
            context = summary_len_L
        turn += 1

    total_output = horizon * per_turn_output_L + summaries * summary_len_L
    total_tokens = total_input + total_output
```

The §6 figures are direct output of this procedure on the §4 inputs.

---

## 13. Open Items Checklist

- [ ] Experiment A — post-summary reaccumulation slope (§8.1)
- [ ] Experiment B — fixed cost decomposition along version axis (§8.2)
- [ ] Experiment C — preservation → quality conversion (§8.3, §8.4)
- [ ] Experiment D — knee sweep (refines A–C)
- [ ] Experiment E — verification reduction rate (§8.5)
- [ ] Add `tokens_system` / `tokens_history` / `tokens_summary_reinput`
      columns to `results` (or `request` JSON)
- [ ] Add `syntax_checks` / `semantic_checks` / `fact_checks` /
      `verify_tokens_in` / `verify_tokens_out` / `agent_meok` columns
- [ ] Publish anonymized multi-turn logs with token decomposition
- [ ] Publish negative results if Gyeol shows no advantage on any claim

---

## 14. Related Documents

- [`README.md`](README.md) — philosophy, Five Axioms, architecture summary
- [`SPEC.md`](SPEC.md) — marks, `E01`–`E33` diagnostic codes, clause schema
- [`data/conversation_flow_30-42.md`](data/conversation_flow_30-42.md) —
  gloss-flow meta-analysis (qualitative evidence of discourse density,
  not efficiency evidence)
- [`gyeol-export.sql`](gyeol-export.sql) — public export of `packets`,
  `jobs`, `results` (single-turn records only; see §10)

---

*This document is a status report. It is intended to be superseded by
measurements, not defended against them.*
