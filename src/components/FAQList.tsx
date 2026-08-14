export const faqs = [
  {
    q: "Are your devices original?",
    a: "Buy & Sell GH focuses on original devices and clear condition details. Customers are encouraged to confirm the exact unit details before payment.",
  },
  {
    q: "Do you accept trade-ins?",
    a: "Yes. Customers can submit device details online and the final offer is confirmed after physical inspection.",
  },
  {
    q: "Do you deliver outside Accra?",
    a: "Delivery may be arranged depending on location. Contact the shop to confirm delivery availability and cost for your area.",
  },
  {
    q: "Can I inspect a phone before buying?",
    a: "The contact page encourages shop visits at Accra, Dome Pillar 2, No Visa for inspection and pickup.",
  },
  {
    q: "Do your devices come with a warranty?",
    a: "Contact the shop to confirm the warranty available for a specific device before purchase.",
  },
  {
    q: "Can I pre-order a specific iPhone model?",
    a: "Yes. Use the Pre-Order page when the model is not currently available. It collects your preferred model, storage, colour, condition and budget.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Payment options should be confirmed directly with the shop for each purchase. Do not send payment until availability and terms are confirmed.",
  },
];

export function FAQList({ limit }: { limit?: number }) {
  return (
    <div className="grid gap-3">
      {(limit ? faqs.slice(0, limit) : faqs).map((faq) => (
        <details key={faq.q} className="faq-item rounded-lg border border-black/7 bg-white p-5 shadow-card">
          <summary className="cursor-pointer text-base font-black text-ink">{faq.q}</summary>
          <p className="mt-3 text-base leading-7 text-ink/70">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
