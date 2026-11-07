// Footer.jsx
function Footer() {
  return (
    <footer className="site-footer">
      <span>For the next person figuring things out by building — <a href="mailto:anuragbuildsthings@gmail.com">anuragbuildsthings@gmail.com</a></span>
      <span><a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>⬆ BACK TO TOP</a></span>
    </footer>
  );
}

window.Footer = Footer;
