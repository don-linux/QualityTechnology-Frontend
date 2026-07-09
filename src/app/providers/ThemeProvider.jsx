import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#006d52", light: "#3aa87d", dark: "#00543f" },
    secondary: { main: "#0D47A1" },
    success: { main: "#2E7D32" },
    background: { default: "#f4f6f8" },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: "'Roboto', 'Segoe UI', sans-serif" },
});

export default function ThemeProvider({ children }) {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
