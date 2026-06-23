import React, { useCallback, useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

const ACCENT = "#38BDF8";
const ACCENT_DEEP = "#0EA5E9";
const MONO = '"DM Mono", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

const accentBtnSx = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 2,
  px: 2.75,
  color: "#06121C",
  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
  boxShadow: "0 8px 22px rgba(14,165,233,0.35)",
  "&:hover": {
    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DEEP})`,
    filter: "brightness(1.06)",
    boxShadow: "0 10px 26px rgba(14,165,233,0.45)",
  },
};

const outlinedDarkSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  px: 2.5,
  color: "#E2E8F0",
  borderColor: "rgba(226,232,240,0.35)",
  "&:hover": { borderColor: "#E2E8F0", bgcolor: "rgba(226,232,240,0.08)" },
};

function CornerBrackets({ active }) {
  const inset = 16;
  const base = {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: ACCENT,
    borderStyle: "solid",
    borderWidth: 0,
    boxShadow: `0 0 10px rgba(56,189,248,0.45)`,
    ...(active
      ? { animation: "bracketPulse 2.2s ease-in-out infinite" }
      : { opacity: 0.85 }),
  };
  return (
    <>
      <Box sx={{ ...base, top: inset, left: inset, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 }} />
      <Box sx={{ ...base, top: inset, right: inset, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 }} />
      <Box sx={{ ...base, bottom: inset, left: inset, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 }} />
      <Box sx={{ ...base, bottom: inset, right: inset, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 }} />
    </>
  );
}

function ShutterButton({ onClick }) {
  return (
    <Box
      role="button"
      aria-label="Capturar fotografía"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        width: 74,
        height: 74,
        borderRadius: "50%",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        border: "3px solid rgba(248,250,252,0.85)",
        transition: "transform .12s ease, box-shadow .2s ease",
        outline: "none",
        "&:hover, &:focus-visible": {
          transform: "scale(1.05)",
          boxShadow: "0 0 26px rgba(56,189,248,0.6)",
        },
        "&:active": { transform: "scale(0.93)" },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(145deg, #ffffff, ${ACCENT})`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <CameraAltRoundedIcon sx={{ color: "#0B1220", fontSize: 27 }} />
      </Box>
    </Box>
  );
}

export default function CapturaIdentificacionModal({ open, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const capturedUrlRef = useRef("");
  const capturedFileRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | requesting | streaming | captured | error
  const [errorMsg, setErrorMsg] = useState("");
  const [capturedUrl, setCapturedUrl] = useState("");

  const clearCaptured = useCallback(() => {
    if (capturedUrlRef.current) {
      URL.revokeObjectURL(capturedUrlRef.current);
      capturedUrlRef.current = "";
    }
    capturedFileRef.current = null;
    setCapturedUrl("");
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    clearCaptured();
    setErrorMsg("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMsg("Este navegador no permite acceder a la cámara, o la página no se sirve por HTTPS.");
      return;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        await video.play().catch(() => {});
      }
      setStatus("streaming");
    } catch (err) {
      stopCamera();
      setStatus("error");
      const name = err?.name;
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setErrorMsg("Permiso de cámara denegado. Habilítalo en el navegador y vuelve a intentarlo.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setErrorMsg("No se detectó ninguna cámara en este dispositivo.");
      } else if (name === "NotReadableError") {
        setErrorMsg("La cámara está siendo usada por otra aplicación.");
      } else {
        setErrorMsg("No se pudo iniciar la cámara. Inténtalo nuevamente.");
      }
    }
  }, [clearCaptured, stopCamera]);

  useEffect(() => {
    if (!open) return undefined;
    startCamera();
    return () => {
      stopCamera();
      clearCaptured();
      setStatus("idle");
    };
  }, [open, startCamera, stopCamera, clearCaptured]);

  const capturar = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        clearCaptured();
        const file = new File([blob], `identificacion_${Date.now()}.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        capturedUrlRef.current = url;
        capturedFileRef.current = file;
        setCapturedUrl(url);
        setStatus("captured");
      },
      "image/jpeg",
      0.92,
    );
  }, [clearCaptured]);

  const reintentarCaptura = useCallback(() => {
    clearCaptured();
    if (streamRef.current) setStatus("streaming");
    else startCamera();
  }, [clearCaptured, startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    clearCaptured();
    setStatus("idle");
    onClose?.();
  }, [stopCamera, clearCaptured, onClose]);

  const usarFoto = useCallback(() => {
    const file = capturedFileRef.current;
    if (file) onCapture?.(file);
    handleClose();
  }, [onCapture, handleClose]);

  const hint =
    status === "captured"
      ? "Revisa que la credencial se vea completa y legible."
      : status === "streaming"
        ? "Encuadra la identificación dentro del marco."
        : status === "error"
          ? "Revisa los permisos de la cámara e inténtalo de nuevo."
          : "Preparando la cámara…";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
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
          backgroundColor: "rgba(4,7,12,0.82)",
          backdropFilter: "blur(6px)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          p: { xs: 2.25, sm: 3 },
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
          "@keyframes revealUp": {
            from: { opacity: 0, transform: "translateY(12px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@keyframes scanMove": {
            "0%": { top: "8%", opacity: 0.2 },
            "50%": { opacity: 0.95 },
            "100%": { top: "92%", opacity: 0.2 },
          },
          "@keyframes bracketPulse": {
            "0%, 100%": { opacity: 0.55 },
            "50%": { opacity: 1 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            animation: "revealUp .5s .05s ease both",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: ACCENT, mb: 0.5 }}>
              <BadgeRoundedIcon sx={{ fontSize: 16 }} />
              <Typography
                component="span"
                sx={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                }}
              >
                Captura segura
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "#F8FAFC",
                fontWeight: 800,
                fontSize: { xs: 20, sm: 24 },
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
              }}
            >
              Identificación del visitante
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
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
            mt: 2.5,
            borderRadius: 3,
            overflow: "hidden",
            aspectRatio: "4 / 3",
            bgcolor: "#05070B",
            border: "1px solid rgba(56,189,248,0.18)",
            animation: "revealUp .5s .12s ease both",
          }}
        >
          <Box
            component="video"
            ref={videoRef}
            autoPlay
            playsInline
            muted
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: status === "captured" ? "none" : "block",
            }}
          />

          {status === "captured" && capturedUrl && (
            <Box
              component="img"
              src={capturedUrl}
              alt="Identificación capturada"
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(120% 120% at 50% 30%, transparent 55%, rgba(2,4,8,0.6) 100%)",
            }}
          />

          {(status === "streaming" || status === "captured") && (
            <CornerBrackets active={status === "streaming"} />
          )}

          {status === "streaming" && (
            <Box
              sx={{
                position: "absolute",
                left: "6%",
                right: "6%",
                height: 2,
                borderRadius: 2,
                background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                boxShadow: `0 0 12px ${ACCENT}`,
                animation: "scanMove 2.6s ease-in-out infinite",
              }}
            />
          )}

          {status === "requesting" && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                color: "rgba(248,250,252,0.8)",
              }}
            >
              <CircularProgress size={34} sx={{ color: ACCENT }} />
              <Typography sx={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em" }}>
                Iniciando cámara…
              </Typography>
            </Box>
          )}

          {status === "error" && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                p: 3,
                textAlign: "center",
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 44, color: "#FB7185" }} />
              <Typography sx={{ color: "#F8FAFC", fontWeight: 700 }}>Cámara no disponible</Typography>
              <Typography sx={{ color: "rgba(248,250,252,0.7)", fontSize: 13, maxWidth: 360 }}>
                {errorMsg}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          sx={{
            mt: 1.5,
            textAlign: "center",
            color: "rgba(148,163,184,0.92)",
            fontSize: 12.5,
            fontFamily: MONO,
            letterSpacing: "0.04em",
            minHeight: 18,
            animation: "revealUp .5s .18s ease both",
          }}
        >
          {hint}
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            minHeight: 74,
            animation: "revealUp .5s .24s ease both",
          }}
        >
          {status === "streaming" && <ShutterButton onClick={capturar} />}

          {status === "captured" && (
            <>
              <Button onClick={reintentarCaptura} startIcon={<ReplayIcon />} variant="outlined" sx={outlinedDarkSx}>
                Volver a tomar
              </Button>
              <Button onClick={usarFoto} startIcon={<CheckRoundedIcon />} variant="contained" sx={accentBtnSx}>
                Usar foto
              </Button>
            </>
          )}

          {status === "error" && (
            <Button onClick={startCamera} startIcon={<ReplayIcon />} variant="contained" sx={accentBtnSx}>
              Reintentar
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
