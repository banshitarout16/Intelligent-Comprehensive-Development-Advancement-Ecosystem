import { createTheme } from "@mui/material/styles";

// PrepVerse design tokens
// Palette: bold yellow accent on a white canvas, near-black text for contrast,
// a single dark neutral for secondary actions, and quiet greys for structure.
const tokens = {
  yellow: "#FFCC00", // primary brand / accent
  yellowDark: "#E6B800", // hover/active state for yellow surfaces
  ink: "#14140F", // primary text - warm black, not pure #000
  charcoal: "#1F1F1A", // secondary actions / dark surfaces
  paper: "#FFFFFF",
  canvas: "#FFFFFF",
  line: "#EAE7DD", // warm hairline border, not cold grey
  muted: "#6B6A62", // secondary text
  success: "#1E8E3E",
  error: "#D93025",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: tokens.yellow,
      dark: tokens.yellowDark,
      contrastText: tokens.ink, // yellow buttons get dark text, not white
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
    borderRadius: 14,
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
        // Chrome/Edge autofill sets its own background + doesn't trigger React's
        // change event, so MUI's floating label never shrinks - causing the
        // label to render on top of the autofilled value. Force a matching
        // background and long transition delay to neutralise the autofill
        // paint, and pair with InputLabelProps={{ shrink: true }} on fields
        // that are commonly autofilled (email, password).
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
