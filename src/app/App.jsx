import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import CustomGlobalStyles from "@shared/styles/GlobalStyles";
import { SnackbarProvider } from "@shared/hooks/useSnackbar";
import { AuthProvider } from "./providers/AuthProvider";
import AppRouter from "./router";

function App() {
  return (
    <Router>
      <CssBaseline />
      <CustomGlobalStyles />
      <AuthProvider>
        <SnackbarProvider>
          <AppRouter />
        </SnackbarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
