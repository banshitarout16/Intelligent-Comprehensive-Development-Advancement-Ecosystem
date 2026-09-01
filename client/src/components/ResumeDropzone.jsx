import { useRef, useState } from "react";
import { Box, Typography, Button, LinearProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFileOutlined";

const MAX_SIZE_MB = 5;

const ResumeDropzone = ({ onFileSelected, uploading, progress }) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const validateAndEmit = (file) => {
    setError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    validateAndEmit(e.dataTransfer.files?.[0]);
  };

  return (
    <Box>
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: "2px dashed",
          borderColor: dragActive ? "primary.main" : "divider",
          borderRadius: 3,
          p: 5,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: dragActive ? "rgba(255,204,0,0.06)" : "background.paper",
          transition: "border-color 0.15s ease, background-color 0.15s ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => validateAndEmit(e.target.files?.[0])}
        />
        <UploadFileIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Drag & drop your resume here, or click to browse
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          PDF only, up to {MAX_SIZE_MB}MB
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Choose file
        </Button>
      </Box>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">
            Uploading... {progress}%
          </Typography>
        </Box>
      )}

      {error && (
        <Typography variant="body2" sx={{ color: "error.main", mt: 1.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ResumeDropzone;
