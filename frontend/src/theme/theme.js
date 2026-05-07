import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#0057B8",
      dark: "#003D82",
      light: "#E8F1FF",
    },
    secondary: {
      main: "#00A896",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
});
