import { getCsrfToken } from './csrfTokenStorage';

const customFetch = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  // --- THIS IS THE FIX ---
  // For any method that is not GET, automatically add the stored CSRF token.
  if (mergedOptions.method && mergedOptions.method.toUpperCase() !== 'GET') {
    const token = getCsrfToken();
    if (token) {
      mergedOptions.headers['X-CSRFToken'] = token;
    } else {
      console.error('CSRF token is missing. The request will likely fail.');
      // You could throw an error here to prevent the request from being sent.
    }
  }
  // --- END OF FIX ---

  return fetch(url, mergedOptions);
};

export default customFetch;