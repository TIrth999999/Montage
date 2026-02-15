export function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-left">
        <img src="/logo.png" alt="Montage" className="brand-logo" />
        <button className="icon-btn" aria-label="Menu">
          <i className="fa-solid fa-bars" />
        </button>
        <div className="project-meta">
          <span className="portfolio">My Portfolio</span>
          <span className="divider">|</span>
          <span className="project-name">Model-1</span>
        </div>
      </div>

      <div className="nav-right">
        <button className="nav-action">
          <i className="fa-solid fa-arrow-up-from-bracket btn-icon" />
          Share
        </button>
        <button className="nav-action">View Plans</button>
        <button className="avatar">TM</button>
      </div>
    </header>
  )
}
