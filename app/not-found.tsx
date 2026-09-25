import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container page" style={{ minHeight: "50vh" }}>
      <div className="mono muted">404</div>
      <h1 className="display" style={{ marginTop: 16 }}>Nothing here.</h1>
      <p className="lede" style={{ marginTop: 16 }}>This page doesn&apos;t exist, or the listing was removed.</p>
      <div className="row" style={{ marginTop: 32 }}>
        <Link href="/apps" className="btn btn--primary">Discover apps</Link>
        <Link href="/" className="btn btn--secondary">Home</Link>
      </div>
    </div>
  );
}
