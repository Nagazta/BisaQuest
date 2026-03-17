import "./BilingualText.css";

// ── Helper: render bilingual text as JSX ──────────────────────────────────
const BilingualText = ({ line }) => (
  <span className="house-bilingual">
    <span className="house-bilingual-bisaya">{line.bisayaText}</span>
    <span className="house-bilingual-english">{line.englishText}</span>
  </span>
);

export default BilingualText;
