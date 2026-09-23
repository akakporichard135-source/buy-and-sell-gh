import { MessageCircle, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import "../styles/product-experience.css";

export function AccountPage() {
  return (
    <div className="customer-account-page">
      <SEO title="Account and Order Support" description="Access your current cart and get help with an existing Buy & Sell GH order request." />
      <section>
        <span className="customer-account-icon"><UserRound aria-hidden="true" /></span>
        <p>Account &amp; orders</p>
        <h1>Your shopping, kept straightforward.</h1>
        <strong>Buy & Sell GH does not currently require customers to create a password-protected account.</strong>
        <span>Use your cart to prepare a new order request, or contact the team with an existing order reference for an update.</span>
        <div className="experience-actions">
          <Link className="experience-button experience-button-primary" to="/cart"><ShoppingBag size={18} /> Open cart</Link>
          <Link className="experience-button experience-button-secondary" to="/contact"><MessageCircle size={18} /> Order support</Link>
        </div>
      </section>
    </div>
  );
}
