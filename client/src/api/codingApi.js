import api from "./axios.js";

export const getLanguages = async () => {
  const { data } = await api.get("/coding/languages");
  return data.languages;
};

export const createCodingProblem = async (config) => {
  const { data } = await api.post("/coding", config);
  return data.session;
};

export const runCode = async (sessionId, code, stdin) => {
  const { data } = await api.post(`/coding/${sessionId}/run`, { code, stdin });
  return data;
};

export const submitCode = async (sessionId, code) => {
  const { data } = await api.post(`/coding/${sessionId}/submit`, { code });
  return data;
};

export const listCodingSessions = async () => {
  const { data } = await api.get("/coding");
  return data.sessions;
};

export const getCodingSession = async (sessionId) => {
  const { data } = await api.get(`/coding/${sessionId}`);
  return data.session;
};

export const deleteCodingSession = async (sessionId) => {
  await api.delete(`/coding/${sessionId}`);
};
