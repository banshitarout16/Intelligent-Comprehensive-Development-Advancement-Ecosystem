import api from "./axios.js";

export const createInterview = async (config) => {
  const { data } = await api.post("/interviews", config);
  return data.interview;
};

export const submitAnswer = async (interviewId, questionId, answer) => {
  const { data } = await api.post(`/interviews/${interviewId}/answer`, { questionId, answer });
  return data.question;
};

export const completeInterview = async (interviewId) => {
  const { data } = await api.post(`/interviews/${interviewId}/complete`);
  return data.interview;
};

export const listInterviews = async () => {
  const { data } = await api.get("/interviews");
  return data.interviews;
};

export const getInterview = async (interviewId) => {
  const { data } = await api.get(`/interviews/${interviewId}`);
  return data.interview;
};

export const deleteInterview = async (interviewId) => {
  await api.delete(`/interviews/${interviewId}`);
};
