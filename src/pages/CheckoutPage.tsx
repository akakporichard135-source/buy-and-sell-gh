import { AppleCheckout } from "../components/checkout/AppleCheckout";
import { SEO } from "../components/SEO";

export function CheckoutPage() {
  return (
    <>
      <SEO
        title="Checkout — Buy & Sell GH"
        description="Review your order details and submit your request for authentic Apple devices in Accra, Ghana."
      />
      <AppleCheckout />
    </>
  );
}
