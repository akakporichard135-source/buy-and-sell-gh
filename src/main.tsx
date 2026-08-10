import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ProductCatalogProvider } from "./catalog/ProductCatalogContext";
import { CartProvider } from "./context/CartContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ProductCatalogProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ProductCatalogProvider>
    </BrowserRouter>
  </StrictMode>,
);
