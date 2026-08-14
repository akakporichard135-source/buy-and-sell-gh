import { FAQList } from "../components/FAQList";
import { SEO } from "../components/SEO";

export function FAQPage() {
  return (
    <>
      <SEO title="Frequently Asked Questions" description="Answers about original devices, trade-ins, delivery, inspection, warranty and pre-orders at Buy & Sell GH." />
      <section className="page-hero">
        <p className="eyebrow-dark">FAQ</p>
        <h1>Questions customers ask before buying</h1>
        <p>Clear guidance for original iPhones, trade-ins, inspection, pre-orders and delivery.</p>
      </section>
      <section className="section max-w-4xl"><FAQList /></section>
    </>
  );
}
