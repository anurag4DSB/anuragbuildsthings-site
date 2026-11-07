// Navbar.jsx
function Navbar({ onNavigate, currentPage }) {
  return (
    <nav className="navbar">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
        anurag builds <em>things</em>
      </a>
      <div className="nav-tools">
        <button className="nav-tool" aria-label="Search" title="Search (⌘K)"><i className="bi bi-search"></i></button>
        <button className="nav-tool" aria-label="RSS"><i className="bi bi-rss"></i></button>
        <a className="nav-tool git" href="https://github.com/anurag4dsb" aria-label="GitHub"><i className="bi bi-git"></i></a>
        <a className="nav-tool yt" href="https://www.youtube.com/@AnuragBuildsThings" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
        <a className="nav-tool li" href="https://www.linkedin.com/in/mittalanu/" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
      </div>
    </nav>
  );
}

window.Navbar = Navbar;
