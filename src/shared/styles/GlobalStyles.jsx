// src/utils/GlobalStyles.jsx
import GlobalStyles from "@mui/material/GlobalStyles";

export default function CustomGlobalStyles() {
  return (
    <GlobalStyles
      styles={{
        /* ==============================
          ESTILOS BASE GLOBALES
        ============================== */
        body: {
          margin: 0,
          backgroundColor: "#f4f6f8", // fondo neutro moderno
          fontFamily: "'Roboto', 'Segoe UI', sans-serif",
          color: "#333",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },

        a: {
          textDecoration: "none",
          color: "inherit",
        },

        /* ==============================
          SCROLLBARS PERSONALIZADOS
        ============================== */
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#bdbdbd",
          borderRadius: "10px",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#9e9e9e",
        },

        /* ==============================
          BOTONES Y TEXTOS MUI
        ============================== */
        ".MuiButton-root": {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: 600,
        },

        ".MuiTypography-h4": {
          fontWeight: "bold",
        },

        /* ==============================
          FORMULARIOS Y CONTENEDORES
        ============================== */
        ".MuiPaper-root": {
          borderRadius: "10px",
        },
        ".MuiInputBase-root": {
          backgroundColor: "#fff",
        },
        ".MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#3aa87d",
          borderWidth: "2px",
        },
        ".MuiButton-containedPrimary": {
          backgroundColor: "#006d52",
          "&:hover": {
            backgroundColor: "#00543f",
          },
        },
      }}
    />
  );
}
