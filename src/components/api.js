const customFetch = async (url, options = {}) => {
    const defaultOptions = {
      credentials: 'include', // This ensures cookies are sent with every request
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
  
    return fetch(url, mergedOptions);
  };
  
  export default customFetch;
  