import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container page" style={{ minHeight: "50vh" }}>
      <h1 className="h1">Page not found</h1>
      <p className="lead" style={{ marginTop: 12 }}>This page doesn&apos;t exist or the listing was removed.</p>
      <Link href="/apps" className="btn btn--primary" style={{ marginTop: 28 }}>Discover apps</Link>
    </div>
  );
}
