import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import axiosInstance from "@shared/lib/axiosInstance";
import { buildUploadUrl } from "@shared/lib/uploadUrl";

const ACCENT = "#38BDF8";
const MONO = '"DM Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

export default function FotoIdentificacionDialog({ open, onClose, path }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !path) return undefined;

    let active = true;
    let objectUrl = "";

    if (String(path).startsWith("http")) {
      setUrl(path);
      setLoading(false);
      setError("");
      return undefined;
    }

    setLoading(true);
    setError("");
    setUrl("");

    axiosInstance
      .get(buildUploadUrl(path), { responseType: "blob" })
      .then(({ data }) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(data);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setError("No se pudo cargar la fotografía.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, path]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "transparent",
          backgroundImage: "none",
          boxShadow: "none",
          overflow: "visible",
          m: { xs: 1.5, sm: 3 },
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(4,7,12,0.85)",
          backdropFilter: "blur(6px)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          p: { xs: 2, sm: 2.5 },
          borderRadius: 5,
          border: "1px solid rgba(56,189,248,0.16)",
          background:
            "radial-gradient(140% 120% at 50% -10%, #131A24 0%, #0A0E14 55%, #070A0F 100%)",
          boxShadow: "0 30px 80px rgba(2,6,12,0.6)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            opacity: 0.6,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.85, color: ACCENT }}>
            <BadgeRoundedIcon sx={{ fontSize: 18 }} />
            <Typography
              component="span"
              sx={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Identificación
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label="Cerrar"
            sx={{
              color: "rgba(248,250,252,0.7)",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#05070B",
            border: "1px solid rgba(56,189,248,0.18)",
            minHeight: 240,
            maxHeight: "72vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                py: 6,
                color: "rgba(248,250,252,0.8)",
              }}
            >
              <CircularProgress size={32} sx={{ color: ACCENT }} />
              <Typography sx={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em" }}>
                Cargando fotografía…
              </Typography>
            </Box>
          )}

          {!loading && error && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                py: 6,
                px: 3,
                textAlign: "center",
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 42, color: "#FB7185" }} />
              <Typography sx={{ color: "rgba(248,250,252,0.85)", fontSize: 14 }}>{error}</Typography>
            </Box>
          )}

          {!loading && !error && url && (
            <Box
              component="img"
              src={url}
              alt="Identificación del visitante"
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "72vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
