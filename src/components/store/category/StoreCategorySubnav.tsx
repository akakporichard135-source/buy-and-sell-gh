import type { CategorySubnavItem } from "./categoryData";

interface StoreCategorySubnavProps {
  items: CategorySubnavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  categoryLabel: string;
}

export function StoreCategorySubnav({
  items,
  activeId,
  onSelect,
  categoryLabel,
}: StoreCategorySubnavProps) {
  if (items.length <= 1) return null;

  return (
    <nav className="store-cat-subnav" aria-label={`${categoryLabel} model navigation`}>
      <div className="store-cat-subnav-container">
        <div className="store-cat-subnav-track">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`store-cat-subnav-pill ${isActive ? "is-active" : ""}`}
                onClick={() => onSelect(item.id)}
                aria-pressed={isActive}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
