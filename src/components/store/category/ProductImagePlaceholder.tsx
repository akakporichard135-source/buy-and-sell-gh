import { ImageIcon } from "lucide-react";

export function ProductImagePlaceholder() {
  return (
    <div className="store-cat-card-placeholder" role="img" aria-label="Product image coming soon">
      <ImageIcon size={28} strokeWidth={1.4} aria-hidden="true" />
      <span>Image coming soon</span>
    </div>
  );
}
