import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";

export function NotFoundPage() {
  return (
    <>
      <SEO title="Page not found" description="The requested Buy & Sell GH page could not be found." />
      <section className="page-hero">
        <h1>Page not found</h1>
        <p>This route does not exist yet.</p>
        <Link className="btn-primary mt-6" to="/">Go home</Link>
      </section>
    </>
  );
}
