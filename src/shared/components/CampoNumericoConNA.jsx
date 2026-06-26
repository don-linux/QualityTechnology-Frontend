import React from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CampoNumerico from "@shared/components/CampoNumerico";

export default function CampoNumericoConNA({
  label,
  name,
  value,
  noAplica,
  onChange,
  onNoAplicaChange,
  ...campoProps
}) {
  const handleNoAplica = (e) => {
    onNoAplicaChange?.({
      target: {
        name: `${name}_no_aplica`,
        value: e.target.checked,
      },
    });
  };

  return (
    <Box>
      <CampoNumerico
        {...campoProps}
        label={label}
        name={name}
        value={noAplica ? "" : value}
        onChange={onChange}
        disabled={noAplica || campoProps.disabled}
        size="small"
        fullWidth
      />
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={Boolean(noAplica)}
            onChange={handleNoAplica}
            name={`${name}_no_aplica`}
          />
        }
        label="N/A"
        sx={{ mt: -0.5 }}
      />
    </Box>
  );
}
