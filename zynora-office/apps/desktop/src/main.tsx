import "@zynora/design-system/tokens.css";
import "@zynora/design-system/components.css";
import "./app.css";
import "./sheets/sheets.css";
import "prosemirror-view/style/prosemirror.css";
import "prosemirror-tables/style/tables.css";
import "prosemirror-gapcursor/style/gapcursor.css";
import "./word/word.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("élément #root introuvable");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
