import { CheckCircle2, MapPin, MessageCircle, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { business } from "../config/business";

const informationSections = [
  {
    title: "Order requests and payment",
    icon: ShieldCheck,
    copy: "Submitting an order request does not complete a purchase or collect payment. Buy & Sell GH confirms the product, price, availability, payment instructions and fulfilment details before payment.",
  },
  {
    title: "Condition and inspection",
    icon: PackageCheck,
    copy: "Condition labels describe the listed product. Used-device photos represent the listed unit when real owner photos are available. Customers can ask questions and arrange inspection before payment.",
  },
  {
    title: "Delivery and pickup",
    icon: Truck,
    copy: `Pickup is available at ${business.location}. Delivery availability, timing and cost depend on the destination and are confirmed with the customer before payment.`,
  },
  {
    title: "Returns and product concerns",
    icon: MessageCircle,
    copy: "Return or exchange terms depend on the specific product, its inspected condition and the terms confirmed before payment. Contact Buy & Sell GH promptly if there is a concern and keep the device in the condition received.",
  },
  {
    title: "Information you submit",
    icon: CheckCircle2,
    copy: "Contact, pre-order, trade-in and order details are used to respond to the request, confirm products and arrange fulfilment. Do not submit passwords, payment PINs or other sensitive account credentials through website forms or WhatsApp.",
  },
  {
    title: "Confirm before travelling",
    icon: MapPin,
    copy: "Contact the shop before visiting so product availability and a suitable inspection or pickup time can be confirmed.",
  },
];

export function ShoppingInformationPage() {
  return (
    <>
      <SEO title="Shopping and Inspection Information" description="How Buy & Sell GH handles order requests, inspection, pickup, delivery, product concerns and customer information." />
      <section className="page-hero">
        <p className="eyebrow-dark">Shopping information</p>
        <h1>Clear steps before you pay</h1>
        <p>Practical information about order requests, product inspection, delivery, pickup and after-sale concerns.</p>
      </section>
      <section className="section shopping-information-grid">
        {informationSections.map(({ title, icon: Icon, copy }) => (
          <article className="shopping-information-item" key={title}>
            <Icon size={22} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <section className="final-cta">
        <div>
          <p className="eyebrow">Need clarification?</p>
          <h2>Confirm the details for your exact device</h2>
          <p>Product-specific availability, warranty, delivery and inspection details are confirmed directly with Buy & Sell GH.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton>Ask on WhatsApp</WhatsAppButton>
          <Link className="btn-glass" to="/contact">Contact the Shop</Link>
        </div>
      </section>
    </>
  );
}
