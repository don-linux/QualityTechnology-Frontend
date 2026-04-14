import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import CustomGlobalStyles from "@shared/styles/GlobalStyles";
import AppRouter from "./router";

function App() {
  return (
    <Router>
      <CssBaseline />
      <CustomGlobalStyles />
      <AppRouter />
    </Router>
  );
}

export default App;
