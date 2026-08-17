import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";

export function NotFoundPage() {
  return (
    <>
      <SEO title="Page not found" description="The requested Buy & Sell GH page could not be found." />
      <section className="page-hero">
        <h1>Page not found</h1>
        <p>The page may have moved. Continue to the catalogue or return to the homepage.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link className="btn-primary" to="/shop">Browse Catalogue</Link>
          <Link className="btn-secondary" to="/">Go Home</Link>
        </div>
      </section>
    </>
  );
}
