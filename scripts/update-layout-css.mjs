import fs from "node:fs";

let css = fs.readFileSync("src/styles/admin.css", "utf8");

// Mobile adjustments
const mobileBlock = `@media (max-width: 1023px) {
  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: 280px;
    max-width: 85vw;
    z-index: 60;
    transform: translateX(-100%);
    transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-sidebar.is-open {
    transform: translateX(0);
  }

  .admin-topbar {
    height: 56px;
    min-height: 56px;
    max-height: 56px;
    padding: 0 1rem;
  }

  .admin-content {
    padding: 1rem 1rem 3rem;
    gap: 1.25rem;
  }
}`;

css = css.replace(/@media \(max-width: 1023px\) \{[\s\S]*?\n\}/, mobileBlock);

fs.writeFileSync("src/styles/admin.css", css, "utf8");
console.log("Updated mobile styles successfully");
