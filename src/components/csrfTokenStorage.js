let storedCsrfToken = null;

export const setCsrfToken = (token) => {
  storedCsrfToken = token;
};

export const getCsrfToken = () => {
  return storedCsrfToken;
};