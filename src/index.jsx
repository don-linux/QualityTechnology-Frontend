import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// IMPORTANTE: agrega estos dos imports 
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Opcional: puedes personalizar este tema después
const theme = createTheme();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
