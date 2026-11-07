// NotFoundPage.jsx
function NotFoundPage({ onNavigate }) {
  return (
    <section className="page-404">
      <div className="glyph">404 signal lost<span className="pulse" style={{marginLeft: 8}}></span></div>
      <h1>This page didn't compile.</h1>
      <p className="lede">Either the URL drifted, or the entry was never shipped.</p>
      <div className="actions">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>← Return to the index</a>
      </div>
    </section>
  );
}

window.NotFoundPage = NotFoundPage;
