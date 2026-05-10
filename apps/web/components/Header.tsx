import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link href="/" className="logo">CryptoLab</Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link">Auth</Link>
          <Link href="/ticker" className="nav-link">Live Tickers</Link>
        </nav>
      </div>
    </header>
  );
}
