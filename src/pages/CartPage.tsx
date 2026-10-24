import { BagReview } from "../components/BagReview";
import { SEO } from "../components/SEO";
import "../styles/apple-bag-checkout.css";

export function CartPage() {
  return (
    <div className="apple-bag-page">
      <SEO
        title="Review your Bag — Buy & Sell GH"
        description="Review your selected Apple devices and proceed to checkout at Buy & Sell GH."
      />
      <div className="apple-bag-shell">
        <header className="apple-bag-header">
          <p className="apple-bag-eyebrow">Buy &amp; Sell GH</p>
          <h1 className="apple-bag-heading">Review your Bag.</h1>
          <p className="apple-bag-subtitle">
            Free store pickup at Dome Pillar 2, Accra or express delivery across Ghana.
          </p>
        </header>
        <BagReview />
      </div>
    </div>
  );
}
