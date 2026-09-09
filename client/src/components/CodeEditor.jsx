import { Box } from "@mui/material";

const CodeEditor = ({ value, onChange, minRows = 16, readOnly = false }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue = value.slice(0, selectionStart) + "  " + value.slice(selectionEnd);
      onChange(newValue);
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      });
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "#14140F",
        overflow: "hidden",
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        rows={minRows}
        style={{
          width: "100%",
          resize: "vertical",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "#FFFFFF",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 14,
          lineHeight: 1.6,
          padding: 16,
          boxSizing: "border-box",
        }}
      />
    </Box>
  );
};

export default CodeEditor;
