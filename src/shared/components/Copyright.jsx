import Typography from "@mui/material/Typography";

const CURRENT_YEAR = new Date().getFullYear();

export default function Copyright() {
  return (
    <Typography
      variant="body2"
      sx={{ mt: 2, color: "text.secondary", fontSize: 13 }}
    >
      © {CURRENT_YEAR} Quality Technology
    </Typography>
  );
}
