# Decision Log

Record of significant decisions made during product development. Decisions are immutable once logged -- if a decision is reversed, log a new entry that references the original.

## Format

```
### [DATE] - [SHORT TITLE]
- **Diamond**: [ID, scale, phase]
- **Decision**: What was decided.
- **Alternatives considered**: What other options were evaluated and why they were rejected.
- **Theory**: Which framework/theory informed this decision (e.g., "Cynefin - Complex domain", "Cagan - Four Risks").
- **Evidence**: What data or research supports this decision.
- **Confidence**: [0.0-1.0] How confident are we, and what would change this.
- **Reversibility**: [easily reversible | costly to reverse | irreversible]
```

## Decisions

### 2026-04-07 - L0 confidence threshold adapted for personal project
- **Diamond**: l0-purpose, Discover→Define
- **Decision**: Adapted L0 confidence threshold from 0.9 to 0.6. The standard threshold assumes an organization defining foundational purpose with market research, competitive analysis, and stakeholder alignment. This is a personal project (father-son game) that also validates the Mycelium framework. Requiring market research for a tic-tac-toe game would be Gold Plating.
- **Alternatives considered**: (1) Run full L0 with market research — rejected as anti-pattern for this context. (2) Skip L0 entirely — rejected because experiencing L0 is part of validating Mycelium.
- **Theory**: Gilad (Evidence-Guided confidence), Anti-patterns (Gold Plating)
- **Evidence**: Founder interview documented in purpose.yml. Clear purpose, JTBD mapped, ethical boundaries set.
- **Confidence**: 0.6 — Single evidence source (self-interview). Would increase with external user feedback.
- **Reversibility**: easily reversible

### 2026-04-07 - L0 Purpose progressed from Discover to Define
- **Diamond**: l0-purpose, Discover→Define
- **Decision**: Progress L0 to Define phase. All applicable theory gates pass (evidence, bias-adapted, corrections). Human approval granted.
- **Alternatives considered**: (1) Stay in Discover and conduct more research — rejected as disproportionate for project scope. (2) Fast-track past Define — rejected because step-by-step validation of Mycelium is the goal.
- **Theory**: Torres (evidence sufficiency), Diamond Rules (phase transitions)
- **Evidence**: purpose.yml, jobs-to-be-done.yml, north-star.yml, user-needs.yml, landscape.yml all populated from interview.
- **Confidence**: 0.6
- **Reversibility**: easily reversible

### 2026-04-07 - Skip L1 Strategy for personal project
- **Diamond**: l0-purpose, Define→Develop
- **Decision**: Skip L1 Strategy diamond entirely. L1 is designed for organizations managing strategic portfolios and bets. This is a solo developer building a personal project — there is no strategic portfolio to manage. Jumping from L0 directly to L2 Opportunity.
- **Alternatives considered**: (1) Create L1 with minimal content — rejected as pure ceremony with no decision value. (2) Create L1 for Mycelium validation — considered, but L1 gates require Wardley mapping and opportunity sizing which add no value here.
- **Theory**: Diamond Rules (spawning rules allow parent-to-child), Anti-patterns (Gold Plating)
- **Evidence**: Solo developer, single product, clear purpose, no competing priorities.
- **Confidence**: 0.7 — Confident this is the right adaptation for context.
- **Reversibility**: easily reversible

### 2026-04-07 - L0 Purpose progressed from Define to Develop
- **Diamond**: l0-purpose, Define→Develop
- **Decision**: Progress L0 to Develop phase. All applicable theory gates pass. Spawning L2 diamond for "Remote Play Connection" opportunity (highest opportunity score: 19).
- **Alternatives considered**: (1) Spawn multiple L2 diamonds — rejected; "solo play" and "local play" are subsets of the remote play opportunity, not separate opportunities.
- **Theory**: Torres (opportunity identification), Diamond Rules (phase transitions, spawning)
- **Evidence**: JTBD mapping shows remote play is the core underserved need. All three game modes serve the same opportunity.
- **Confidence**: 0.6
- **Reversibility**: easily reversible

### 2026-04-07 - L2 fast-tracked Discover→Define→Develop
- **Diamond**: l2-remote-play, Discover→Define→Develop
- **Decision**: Fast-track L2 through two transitions in one step. Interview front-loaded the discovery and definition work: JTBD mapped, opportunity scored, four risks assessed, Cynefin classified, privacy addressed by design. OST populated with 3 solutions (vs CPU, online 2-player, local 2-player) with ICE scores and assumptions. Confidence thresholds adapted (0.8→0.55) — full user base already interviewed.
- **Alternatives considered**: (1) Step through each transition individually — rejected as ceremony without added decision value; all gates already pass. (2) Skip directly to L3 — rejected; OST needed to be formally populated.
- **Theory**: Torres (OST construction from research), Gilad (ICE scoring), Cagan (four risks), Snowden (Cynefin classification)
- **Evidence**: opportunities.yml populated with structured OST. 3 solutions with ICE scores, assumptions, and evidence links.
- **Confidence**: 0.55
- **Reversibility**: easily reversible

### 2026-04-07 - L3 vs CPU created and fast-tracked to Deliver
- **Diamond**: l3-vs-cpu, Discover→Define→Develop→Deliver
- **Decision**: Create L3 for vs CPU solution and fast-track to Deliver phase. Clear Cynefin domain — tic-tac-toe vs CPU is a commodity solution with well-known patterns (minimax, React game board). No benefit to extended discovery or prototyping. Solution design: 3x3 grid, large touch targets, CPU with difficulty option, player goes first, React+TS client-side only. Spawning L4 for implementation.
- **Alternatives considered**: (1) Prototype first — rejected; the game is too simple to need a prototype. (2) Explore alternative game mechanics — rejected; classic tic-tac-toe is the explicit requirement.
- **Theory**: Cynefin (Clear domain → apply best practice), Anti-patterns (Gold Plating avoidance)
- **Evidence**: Commodity solution pattern. ICE score 8.0 (high ease). All four risks assessed and passing.
- **Confidence**: 0.65 (adapted threshold from 0.75)
- **Reversibility**: easily reversible

### 2026-04-07 - L4 vs CPU implementation diamond spawned
- **Diamond**: l4-vs-cpu-impl, created in Discover
- **Decision**: Spawn L4 feature diamond for vs CPU implementation. This is where actual code delivery begins. Next step: define acceptance criteria (L4 Define), then bootstrap the project (L4 Develop/Deliver).
- **Alternatives considered**: None — natural spawning from L3 Deliver.
- **Theory**: Diamond Rules (L3 Deliver spawns L4)
- **Evidence**: Solution design agreed. Tech stack confirmed (React + TypeScript).
- **Confidence**: 0.6
- **Reversibility**: easily reversible

