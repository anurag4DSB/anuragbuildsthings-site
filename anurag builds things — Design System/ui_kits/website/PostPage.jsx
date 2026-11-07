// PostPage.jsx — single article view, mirrors the live post layout
function PostPage({ slug, onNavigate }) {
  const post = window.POSTS.find(p => p.slug === slug) || window.POSTS[0];
  const idx = window.POSTS.findIndex(p => p.slug === post.slug);
  const newer = idx > 0 ? window.POSTS[idx - 1] : null;
  const older = idx < window.POSTS.length - 1 ? window.POSTS[idx + 1] : null;
  const [activeToc, setActiveToc] = React.useState('the-question');

  // Body content keyed by slug. Hand-ported from reference/posts/ — voice canon.
  const bodies = {
    'augmentations-are-the-model': (
      <>
        <h2 id="the-question">The question</h2>
        <p>In the previous post I claimed augmentations are the most critical design choice in contrastive learning — that they define the invariances the model learns, and everything else (architecture, batch size, epochs) is secondary.</p>
        <p>That was a hypothesis. This post runs the experiment.</p>
        <h2 id="setup">Setup</h2>
        <p>Four augmentation recipes, held constant everywhere else: ResNet-18 encoder, NT-Xent loss, batch 512, 200 epochs, temperature 0.5, LARS optimizer with cosine decay.</p>
        <pre>{`┌────────────┬───────────────┬─────────────┐
│ config     │ linear probe  │ Δ vs minimal│
├────────────┼───────────────┼─────────────┤
│ minimal    │      48.3%    │      -      │
│ moderate   │      71.9%    │   +23.6 pp  │
│ full       │      83.7%    │   +35.4 pp  │
│ aggressive │      82.1%    │   +33.8 pp  │
└────────────┴───────────────┴─────────────┘`}</pre>
        <h2 id="results">Results</h2>
        <p>Three things jump out.</p>
        <p><strong>1. The minimal run is barely better than a random projection.</strong> 48% on CIFAR-10 is not good. A logistic regression on raw pixels gets ~40%.</p>
        <p><strong>2. Color jitter alone moves the needle more than anything else.</strong> The jump from moderate (71.9%) to full (83.7%) is almost entirely color jitter and blur.</p>
        <p><strong>3. Aggressive is <em>worse</em> than full.</strong> Not much — but consistently, across 3 seeds. Too-strong augmentation breaks the positive pair.</p>
        <div className="callout callout-tip">
          <div className="callout-title">TIP</div>
          <p style={{margin:0}}>Pick your augmentations the way you'd pick your labels. They <em>are</em> your labels, in contrastive learning.</p>
        </div>
        <h2 id="cleaner-framing">The cleaner framing</h2>
        <p>"Stronger augmentation is better" is the summary most people walk away with. I don't think that's right.</p>
        <p>The cleaner framing: <strong>augmentations define the equivalence relation</strong>. A contrastive loss says "these two things are the same." Augmentations determine what "same" means.</p>
        <h2 id="takeaway">Takeaway</h2>
        <p>Pick your augmentations the way you'd pick your labels. Everything else is compute.</p>
      </>
    )
  };
  const body = bodies[post.slug] || (
    <>
      <h2 id="the-question">The question</h2>
      <p>This post recreation in the design system shows the visual chrome — the post body in this UI kit only renders the canonical example post in full. Pick <em>Augmentations Are the Model</em> from the home page to see the prose treatments.</p>
      <h2 id="setup">Setup</h2>
      <p>Headings, body copy, callouts, code blocks, and prev/next nav follow the same patterns regardless of post.</p>
    </>
  );

  const tocItems = [
    {id: 'the-question', label: 'The question'},
    {id: 'setup', label: 'Setup'},
    {id: 'results', label: 'Results'},
    {id: 'cleaner-framing', label: 'The cleaner framing'},
    {id: 'takeaway', label: 'Takeaway'}
  ];

  return (
    <div className="post-layout">
      <aside className="toc">
        <div className="toc-title">ON THIS PAGE</div>
        <nav>
          {tocItems.map(t => (
            <a key={t.id} href={`#${t.id}`} className={activeToc === t.id ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveToc(t.id); document.getElementById(t.id)?.scrollIntoView({block:'start',behavior:'smooth'}); }}>{t.label}</a>
          ))}
        </nav>
      </aside>
      <div></div>
      <article className="post-article">
        <h1 className="post-title">{post.title}</h1>
        <p className="post-dek">{post.description}</p>
        <div className="post-cats">
          {post.categories.map(c => <span key={c} className="chip">{c}</span>)}
        </div>
        <div className="post-meta-line">
          <span>{post.date}</span><span className="dot">·</span><span>7 MIN READ</span><span className="dot">·</span><span>1,240 WORDS</span>
        </div>
        {body}
        <nav className="post-footer" aria-label="Post navigation">
          {older ? (
            <button className="post-nav prev" onClick={() => onNavigate('post', older.slug)}>
              <span className="post-nav-label">← Previous in log</span>
              <span className="post-nav-title">{older.title}</span>
            </button>
          ) : (
            <span className="post-nav prev" style={{opacity:0.4, cursor:'default'}}>
              <span className="post-nav-label">Start of log</span>
              <span className="post-nav-title" style={{color:'var(--ink-3)'}}>—</span>
            </span>
          )}
          {newer ? (
            <button className="post-nav next" onClick={() => onNavigate('post', newer.slug)}>
              <span className="post-nav-label">Next in log →</span>
              <span className="post-nav-title">{newer.title}</span>
            </button>
          ) : (
            <span className="post-nav next" style={{opacity:0.4, cursor:'default'}}>
              <span className="post-nav-label">Latest entry</span>
              <span className="post-nav-title" style={{color:'var(--ink-3)'}}>—</span>
            </span>
          )}
        </nav>
      </article>
    </div>
  );
}

window.PostPage = PostPage;
