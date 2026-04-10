import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SvgIcon from "@mui/material/SvgIcon";
import TextField from "@mui/material/TextField";

function EyeOpenIcon(props) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="12"
        r="3.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </SvgIcon>
  );
}

function EyeClosedIcon(props) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path
        d="M3.5 8.7A14.5 14.5 0 0 0 2 12s3.6 6 10 6c2.1 0 3.9-.6 5.4-1.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M8 6.8A11.4 11.4 0 0 1 12 6c6.4 0 10 6 10 6a14 14 0 0 1-1.9 2.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M9.7 9.8a3.2 3.2 0 0 0 4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M4 4 20 20"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </SvgIcon>
  );
}

export default function PasswordField({ slotProps, ...props }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={isVisible ? "text" : "password"}
      slotProps={{
        ...slotProps,
        input: {
          ...(slotProps?.input || {}),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={isVisible}
                edge="end"
                onClick={() => setIsVisible((current) => !current)}
                onMouseDown={(event) => event.preventDefault()}
                size="small"
                sx={{ p: 0.75, color: "#546E7A" }}
              >
                {isVisible ? (
                  <EyeOpenIcon sx={{ fontSize: "1.15rem" }} />
                ) : (
                  <EyeClosedIcon sx={{ fontSize: "1.15rem" }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
