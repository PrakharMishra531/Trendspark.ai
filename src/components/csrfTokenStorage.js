let storedCsrfToken = null;

export const setCsrfTokenGlobally = (token) => {
  console.log('Setting CSRF Token Globally:', token); // Log when the token is set
  storedCsrfToken = token;
};

export const getCsrfTokenGlobally = () => {
  console.log('Getting CSRF Token Globally:', storedCsrfToken); // Log when the token is retrieved
  return storedCsrfToken;
};