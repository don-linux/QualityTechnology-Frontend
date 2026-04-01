// src/components/Login.jsx
import React, { useState } from "react";
import axios from "../utils/axiosInstance.js";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Person from "@mui/icons-material/Person";
import Lock from "@mui/icons-material/Lock";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useNavigate } from "react-router-dom";

import useFormValidation from "../hooks/useFormValidation";

const requiredFields = ["usuario", "password"];

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { errors, validate, clearFieldError } = useFormValidation();

  const handleLogin = async () => {
    if (!validate({ usuario, password }, requiredFields)) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/usuarios/login", {
        nombre: usuario,
        contrasena: password,
      });

      if (!data.usuario) throw new Error("Respuesta inválida del servidor");

      const usuarioId =
        data.usuario.fi_usuario_id ||
        data.usuario.usuario_id ||
        data.usuario.id_usuario ||
        data.usuario.id ||
        null;
      if (!usuarioId)
        throw new Error("El servidor no devolvió un ID de usuario válido.");

      const rolTexto = data.usuario.rol || data.usuario.rol_nombre || "";
      const rolNormalizado = rolTexto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      localStorage.setItem("auth", "true");
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("refreshToken", data.refreshToken || "");
      localStorage.setItem("rol", rolNormalizado);
      localStorage.setItem("nombre", data.usuario.nombre || "Usuario");
      localStorage.setItem("usuario_id", usuarioId.toString());
      localStorage.setItem("modulos", JSON.stringify(data.modulos || []));

      let granjaAsignada = "ALL";
      if (rolNormalizado.toLowerCase().includes("gam")) granjaAsignada = "Medellin";
      if (rolNormalizado.toLowerCase().includes("gac")) granjaAsignada = "La Ceiba";
      localStorage.setItem("granja", granjaAsignada);

      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error("Error en login:", err);
      const msg = err.response?.data?.error || err.message;
      setError(
        msg === "Failed to fetch" || err.code === "ERR_NETWORK"
          ? "No se pudo conectar con el servidor. Verifica que el backend esté corriendo."
          : msg || "Error de autenticación"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1B5E20 0%, #0D47A1 100%)",
        p: 2,
      }}
    >
      {/* Logos */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        <img src="/images/ceiba.png" alt="La Ceiba" style={{ width: 150 }} />
        <img src="/images/quality.png" alt="Quality" style={{ width: 150 }} />
        <img src="/images/medellin.png" alt="Medellin" style={{ width: 150 }} />
      </Box>

      {/* Formulario con animación */}
      <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: { xs: "90vw", sm: 350 },
            borderRadius: 4,
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(255,255,255,0.9)",
            textAlign: "center",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 250,
              }}
            >
              <CircularProgress color="primary" size={50} sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Verificando credenciales...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                variant="h5"
                sx={{ mb: 2, fontWeight: "bold", color: "#0D47A1" }}
              >
                Iniciar Sesión
              </Typography>

              <TextField
                label="Usuario"
                fullWidth
                margin="normal"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  clearFieldError("usuario");
                }}
                error={!!errors.usuario}
                helperText={errors.usuario}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "#1B5E20" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                error={!!errors.password}
                helperText={errors.password}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#1B5E20" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}

              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 3,
                  py: 1,
                  backgroundColor: "#2E7D32",
                  fontWeight: "bold",
                  borderRadius: 3,
                  "&:hover": { backgroundColor: "#1B5E20" },
                }}
                onClick={handleLogin}
              >
                Acceder
              </Button>

              <Typography
                variant="body2"
                sx={{ mt: 2, color: "text.secondary", fontSize: 13 }}
              >
                © 2025 Quality Technology . Medellin . Ceiba  .
              </Typography>
            </>
          )}
        </Paper>
      </m.div>
      </LazyMotion>
    </Box>
  );
};

export default Login;
