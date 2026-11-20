import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import type { DesktopMegaMenuData } from "../catalog/desktopNavMenuBuilder";

export interface DesktopMegaMenuProps {
  menu: DesktopMegaMenuData | null;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
  onNavigate: () => void;
  onBlur: (event: React.FocusEvent<HTMLDivElement>) => void;
}

/**
 * Reusable Apple-style full-width desktop hover mega-menu panel.
 * Strictly rendered on desktop (> 834px) via body portal so header mouseleave
 * and backdrop outside-clicks work cleanly without trapping header bounds.
 */
export function DesktopMegaMenu({
  menu,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClose,
  onNavigate,
  onBlur,
}: DesktopMegaMenuProps) {
  if (!menu || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        data-testid="desktop-mega-backdrop"
        className={`desktop-mega-backdrop ${isOpen ? "is-open" : "is-closing"}`}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        id="global-desktop-mega-menu"
        data-testid="desktop-mega-menu"
        data-active-category={menu.categoryId}
        role="region"
        aria-label={`${menu.categoryLabel} navigation menu`}
        className={`desktop-mega-panel ${isOpen ? "is-open" : "is-closing"}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onBlur={onBlur}
      >
        <div
          key={menu.categoryId}
          className="desktop-mega-inner"
          data-testid={`desktop-mega-content-${menu.categoryId}`}
        >
          {menu.columns.map((column, colIdx) => (
            <div
              key={column.id}
              className={`desktop-mega-col ${
                column.variant === "primary" ? "is-primary" : "is-secondary"
              }`}
              style={{ "--col-idx": colIdx } as React.CSSProperties}
            >
              <p className="desktop-mega-heading">{column.heading}</p>
              <ul className="desktop-mega-list">
                {column.items.map((item, itemIdx) => (
                  <li key={`${column.id}-${item.to}`}>
                    <Link
                      to={item.to}
                      data-testid={`desktop-mega-link-${menu.categoryId}-${colIdx}-${itemIdx}`}
                      className={`desktop-mega-link ${
                        column.variant === "primary" ? "is-primary" : "is-secondary"
                      }`}
                      onClick={onNavigate}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
