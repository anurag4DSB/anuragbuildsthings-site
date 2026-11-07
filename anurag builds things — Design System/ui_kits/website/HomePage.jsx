// HomePage.jsx — homepage with hero typewriter rotator + status strip + filtered listing
const POSTS = [
  {
    slug: 'augmentations-are-the-model',
    title: 'Augmentations Are the Model',
    description: "Four augmentation recipes on CIFAR-10, held constant everywhere else. The result isn't subtle — and the pattern has a cleaner explanation than 'stronger is better'.",
    date: '15 APR 2026',
    categories: ['SELF-SUPERVISED-LEARNING', 'CONTRASTIVE-LEARNING', 'AUGMENTATIONS'],
    image: '../../assets/figures/fig-ablation.png',
    imageAlt: 'Linear probe accuracy by augmentation recipe.'
  },
  {
    slug: 'why-augmentations-matter',
    title: 'Why Augmentations Matter',
    description: 'In contrastive learning, augmentations define the equivalence relation. Architecture and batch size are secondary.',
    date: '02 APR 2026',
    categories: ['SELF-SUPERVISED-LEARNING', 'AUGMENTATIONS'],
    image: '../../assets/figures/fig-aug-matrix.png',
    imageAlt: 'Augmentation matrix.'
  },
  {
    slug: 'ssl-representation',
    title: 'SSL Representations: What Gets Learned',
    description: 'Probing the geometry of self-supervised features — invariances, alignment, and the gap between linear-probe accuracy and downstream transfer.',
    date: '24 MAR 2026',
    categories: ['SELF-SUPERVISED-LEARNING', 'REPRESENTATION-LEARNING'],
    image: '../../assets/figures/fig-simclr.png',
    imageAlt: 'SimCLR diagram.'
  },
  {
    slug: 'self-supervised-learning',
    title: 'Self-Supervised Learning',
    description: 'Core intuition behind self-supervised learning: why it works, when to use it, and how it connects to real systems.',
    date: '18 MAR 2026',
    categories: ['SELF-SUPERVISED-LEARNING', 'REPRESENTATION-LEARNING', 'FUNDAMENTALS'],
    image: '../../assets/figures/fig-ssl-overview.png',
    imageAlt: 'Four pretext tasks.'
  }
];

const ROTATOR_WORDS = ['things', 'RAG', 'intelligent systems', 'systems', 'world models'];
const TYPE_MS = 75, BACK_MS = 42, HOLD_MS = 2500, EMPTY_MS = 380;

function HeroRotator() {
  const [text, setText] = React.useState('things');
  const [longest, setLongest] = React.useState('intelligent systems');
  const idxRef = React.useRef(0);

  React.useEffect(() => {
    setLongest(ROTATOR_WORDS.reduce((a, b) => b.length > a.length ? b : a, ''));
    let cancelled = false;
    let timeout;
    const later = (fn, ms) => { timeout = setTimeout(fn, ms); };
    function typeIn(word, done) {
      let i = 0;
      const step = () => {
        if (cancelled) return;
        setText(word.slice(0, i));
        if (i < word.length) { i++; later(step, TYPE_MS); }
        else later(done, HOLD_MS);
      };
      step();
    }
    function backspace(done) {
      let cur = ROTATOR_WORDS[idxRef.current];
      let i = cur.length;
      const step = () => {
        if (cancelled) return;
        setText(cur.slice(0, i));
        if (i > 0) { i--; later(step, BACK_MS); }
        else later(done, EMPTY_MS);
      };
      step();
    }
    function loop() {
      typeIn(ROTATOR_WORDS[idxRef.current], () => {
        backspace(() => { idxRef.current = (idxRef.current + 1) % ROTATOR_WORDS.length; loop(); });
      });
    }
    loop();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, []);

  return (
    <span className="rotator" aria-live="polite">
      <span className="ghost" aria-hidden="true">{longest}</span>
      <span className="stage" aria-hidden="true">
        <span className="typed">{text}</span>
        <span className="cursor"></span>
      </span>
    </span>
  );
}

function StatusStrip({ count }) {
  return (
    <div className="status-strip">
      <div className="status-cell">
        <span className="label"><span className="pulse"></span>CURRENTLY</span>
        <span className="value">Linear probes on CIFAR-10</span>
      </div>
      <div className="status-cell">
        <span className="label">LAST SHIPPED</span>
        <span className="value">15 APR 2026</span>
      </div>
      <div className="status-cell">
        <span className="label">CADENCE</span>
        <span className="value">~2 / month</span>
      </div>
      <div className="status-cell right">
        <span className="label">INDEX</span>
        <span className="value">{count} entries</span>
      </div>
    </div>
  );
}

function HomePage({ onOpenPost }) {
  const [filter, setFilter] = React.useState('ALL');
  const allCats = React.useMemo(() => {
    const s = new Set();
    POSTS.forEach(p => p.categories.forEach(c => s.add(c)));
    return ['ALL', ...Array.from(s)];
  }, []);
  const filtered = filter === 'ALL' ? POSTS : POSTS.filter(p => p.categories.includes(filter));

  return (
    <>
      <div className="frame">
        <h1 className="hero-standfirst">
          anurag builds <HeroRotator />
        </h1>
        <p className="hero-dek">
          I build things to understand how they actually work. A question, a system built to answer it, a comparison against real data. Just the code, the curves, and what they actually mean.
        </p>
        <StatusStrip count={filtered.length} />
        <div className="section-head">
          <span className="label">THE LOG · {filtered.length} {filtered.length === 1 ? 'ENTRY' : 'ENTRIES'}</span>
          <div className="filter-chord">
            {allCats.map(c => (
              <button key={c} className={`chip ${filter === c ? 'on' : ''}`} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="listing">
          {filtered.map(p => <ListingEntry key={p.slug} post={p} onOpen={onOpenPost} />)}
        </div>
      </div>
    </>
  );
}

window.HomePage = HomePage;
window.POSTS = POSTS;
