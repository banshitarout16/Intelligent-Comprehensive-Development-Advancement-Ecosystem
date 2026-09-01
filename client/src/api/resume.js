import api from "./axios.js";

export const uploadResumeFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("resume", file);

  const { data } = await api.post("/resumes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data.resume;
};

export const analyzeResume = async (resumeId) => {
  const { data } = await api.post(`/resumes/${resumeId}/analyze`);
  return data.resume;
};

export const listResumes = async () => {
  const { data } = await api.get("/resumes");
  return data.resumes;
};

export const getResume = async (resumeId) => {
  const { data } = await api.get(`/resumes/${resumeId}`);
  return data.resume;
};

export const getLatestResume = async () => {
  const { data } = await api.get("/resumes/latest");
  return data.resume;
};

export const deleteResume = async (resumeId) => {
  await api.delete(`/resumes/${resumeId}`);
};

export const resumeFileUrl = (resumeId) => {
  const base = api.defaults.baseURL || "";
  return `${base}/resumes/${resumeId}/file`;
};
