// ListingEntry.jsx
function ListingEntry({ post, onOpen }) {
  return (
    <a className="post-row" href="#" onClick={(e) => { e.preventDefault(); onOpen(post.slug); }}>
      <div className="post-body">
        <h3 className="pr-title">{post.title}</h3>
        <p className="pr-dek">{post.description}</p>
        <div className="pr-cats">
          {post.categories.map(c => <span key={c} className="chip">{c}</span>)}
        </div>
      </div>
      <div className="pr-meta">{post.date}</div>
      <div className="pr-thumb"><img src={post.image} alt={post.imageAlt || ''} /></div>
    </a>
  );
}

window.ListingEntry = ListingEntry;
