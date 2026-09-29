import { Link } from "@tanstack/react-router";

const sections = [
  {
    title: "What problem this math solves",
    summary:
      "People see conflicting medical advice. SALUS uses math to combine many studies into one clearer picture, while still showing uncertainty honestly.",
    bullets: [
      "It compares different treatment options using the same transparent rules.",
      "It does not hide weak evidence behind fancy wording.",
      "It shows confidence and risk side by side, not just one score.",
    ],
  },
  {
    title: "How the score is built in plain English",
    summary:
      "Each study adds points. Better study quality adds more points. Older studies gradually lose some weight. Very tiny studies count less than larger ones.",
    bullets: [
      "Grade A studies start stronger than Grade B or C.",
      "Randomized trials usually count more than observational reports.",
      "If many independent studies agree, confidence improves.",
    ],
  },
  {
    title: "Why evidence gets weaker over time",
    summary:
      "Medicine changes. A strong old paper may still matter, but newer results can correct or refine it. SALUS uses time decay so very old findings do not dominate forever.",
    bullets: [
      "Recent high-quality evidence gets more influence.",
      "Legacy evidence still remains visible for context.",
      "This keeps recommendations current rather than frozen in the past.",
    ],
  },
  {
    title: "What uncertainty means",
    summary:
      "Uncertainty is not failure. It is honesty. SALUS shows confidence bands and confidence levels so users can see how sure or unsure the data really is.",
    bullets: [
      "If confidence is low, the platform says so clearly.",
      "If a recommendation is not reliable, it is marked insufficient evidence.",
      "This prevents overconfident health claims.",
    ],
  },
  {
    title: "How safety math works",
    summary:
      "SALUS models interaction risk over time, especially when two interventions can interfere with each other. It estimates when risk is likely to peak.",
    bullets: [
      "Shows likely peak-risk window.",
      "Separates expected benefit from interaction burden.",
      "Helps users discuss timing and monitoring with clinicians.",
    ],
  },
  {
    title: "Why this matters for real people",
    summary:
      "The goal is not to replace doctors. The goal is to make evidence easier to understand and harder to misuse.",
    bullets: [
      "Patients get clearer expectations and fewer surprises.",
      "Clinicians get transparent source-backed summaries.",
      "Researchers can quickly see where evidence is strong or missing.",
    ],
  },
] as const;

const glossary = [
  {
    term: "Evidence Grade",
    meaning: "A quality label (A/B/C) describing how strong the available research is.",
  },
  {
    term: "Recency Decay",
    meaning: "A rule that slowly reduces the influence of old studies so newer evidence can matter.",
  },
  {
    term: "Confidence Gate",
    meaning: "A threshold check that blocks overconfident recommendations when evidence is weak.",
  },
  {
    term: "Uncertainty Band",
    meaning: "A range that shows where the true outcome is likely to fall, not just one exact number.",
  },
  {
    term: "Interaction Dynamics",
    meaning: "How the combined effect of two interventions changes over time and risk level.",
  },
] as const;

export function MathExplainer() {
  return (
    <section className="math-page" aria-label="SALUS math explainer">
      <article className="panel math-hero">
        <span className="eyebrow">Math Explainer</span>
        <h2>How SALUS uses math, in everyday language</h2>
        <p className="muted">
          This page explains the scoring and safety logic without jargon. If you want the formal equations and validation rules,
          read the full specification in docs/CALCULUS_MATH_SPEC.md.
        </p>
        <div className="math-hero-actions">
          <Link to="/" className="compare-link">Back to dashboard</Link>
          <Link to="/compare/$conditionId" params={{ conditionId: "cond-type2-diabetes" }} className="compare-link">
            See side-by-side comparison
          </Link>
        </div>
      </article>

      <div className="math-sections-grid">
        {sections.map((section) => (
          <article key={section.title} className="panel math-section-card">
            <h3>{section.title}</h3>
            <p>{section.summary}</p>
            <ul>
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article className="panel math-example-card">
        <h3>Simple example</h3>
        <p>
          Imagine two treatments for the same condition. Treatment A has three strong, recent studies. Treatment B has one small,
          older study. SALUS gives both treatments visibility, but Treatment A gets a higher confidence score because the evidence is
          stronger, newer, and more repeatable.
        </p>
        <p>
          If new studies later support Treatment B, its score can rise. This is why SALUS calls evidence a living system, not a fixed label.
        </p>
      </article>

      <article className="panel math-glossary-card">
        <h3>Quick glossary</h3>
        <div className="math-glossary-grid">
          {glossary.map((item) => (
            <div key={item.term} className="math-glossary-item">
              <strong>{item.term}</strong>
              <span>{item.meaning}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel math-disclaimer-card">
        <h3>Important disclaimer</h3>
        <p className="muted">
          SALUS is an evidence interpretation platform. It does not diagnose, prescribe, or replace qualified clinical advice.
          Use it to ask better questions with your care team.
        </p>
      </article>
    </section>
  );
}
