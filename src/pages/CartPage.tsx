import { BagReview } from "../components/BagReview";
import { SEO } from "../components/SEO";

export function CartPage() {
  return <>
    <SEO title="Your Bag" description="Review your Buy & Sell GH products and place your order request via WhatsApp." />
    <section className="page-hero bag-page-heading">
      <p className="eyebrow-dark">Buy & Sell GH</p>
      <h1>Your Bag</h1>
    </section>
    <section className="section bag-page-review"><BagReview /></section>
  </>;
}
