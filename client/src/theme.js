import { createTheme } from "@mui/material/styles";


const tokens = {
  yellow: "#FFCC00",
  yellowDark: "#E6B800",
  yellowTint: "rgba(255, 204, 0, 0.16)",
  ink: "#14140F",
  charcoal: "#1F1F1A",
  paper: "#FFFFFF",
  canvas: "#FDF3D4",
  line: "#EAE7DD",
  muted: "#6B6A62",
  success: "#1E8E3E",
  error: "#D93025",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: tokens.yellow,
      dark: tokens.yellowDark,
      contrastText: tokens.ink, 
    },
    secondary: {
      main: tokens.charcoal,
      contrastText: tokens.paper,
    },
    success: { main: tokens.success },
    error: { main: tokens.error },
    background: {
      default: tokens.canvas,
      paper: tokens.paper,
    },
    text: {
      primary: tokens.ink,
      secondary: tokens.muted,
    },
    divider: tokens.line,
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: `"Manrope", "Inter", "Helvetica", "Arial", sans-serif`,
    h1: { fontFamily: `"Manrope", sans-serif`, fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontFamily: `"Manrope", sans-serif`, fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontFamily: `"Manrope", sans-serif`, fontWeight: 800, letterSpacing: "-0.01em" },
    h4: { fontFamily: `"Manrope", sans-serif`, fontWeight: 800, letterSpacing: "-0.01em" },
    h5: { fontFamily: `"Manrope", sans-serif`, fontWeight: 700 },
    h6: { fontFamily: `"Manrope", sans-serif`, fontWeight: 700 },
    button: { fontWeight: 700, letterSpacing: "0.01em" },
    body1: { fontFamily: `"Inter", sans-serif` },
    body2: { fontFamily: `"Inter", sans-serif` },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.canvas },
        "*:focus-visible": {
          outline: `3px solid ${tokens.yellow}`,
          outlineOffset: "2px",
        },
     
        "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus": {
          WebkitTextFillColor: tokens.ink,
          WebkitBoxShadow: `0 0 0 1000px ${tokens.paper} inset`,
          boxShadow: `0 0 0 1000px ${tokens.paper} inset`,
          transition: "background-color 5000s ease-in-out 0s",
          caretColor: tokens.ink,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.paper,
          color: tokens.ink,
          borderBottom: `1px solid ${tokens.line}`,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 10,
          paddingLeft: 20,
          paddingRight: 20,
        },
        containedPrimary: {
          backgroundColor: tokens.yellow,
          color: tokens.ink,
          "&:hover": { backgroundColor: tokens.yellowDark },
        },
        outlinedPrimary: {
          borderColor: tokens.ink,
          color: tokens.ink,
          borderWidth: 2,
          "&:hover": { borderWidth: 2, backgroundColor: "rgba(20,20,15,0.04)" },
        },
        containedSecondary: {
          backgroundColor: tokens.charcoal,
          "&:hover": { backgroundColor: "#000000" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${tokens.line}`,
        },
        elevation1: {
          boxShadow: "0 1px 2px rgba(20,20,15,0.04)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.line}`,
          boxShadow: "0 1px 2px rgba(20,20,15,0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: tokens.yellow,
          color: tokens.ink,
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.ink,
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: tokens.line,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.yellow,
          color: tokens.ink,
          fontWeight: 700,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: tokens.ink,
          fontWeight: 700,
          textDecorationColor: tokens.yellow,
          textDecorationThickness: "2px",
        },
      },
    },
  },
});

export default theme;
export { tokens };