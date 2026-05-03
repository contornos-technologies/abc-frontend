import api from "./api";

// Perfil
export const getProfile = async () => {
  const response = await api.get("/students/me");
  return response.data;
};

// Inscrições
export const getTargets = async () => {
  const response = await api.get("/students/me/targets");
  return response.data;
};

// Pagamentos
export const getPayments = async () => {
  const response = await api.get("/students/me/payments");
  return response.data;
};