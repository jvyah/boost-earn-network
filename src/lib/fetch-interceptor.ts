// Intercepts global fetch to attach the auth token to all API requests
// This allows the generated orval hooks to work seamlessly with our auth state

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem('boost_earn_token');
  
  // Only intercept relative /api calls
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  
  if (url.startsWith('/api') && token) {
    const headers = new Headers(init?.headers);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Don't override Content-Type if it's FormData
    if (init?.body instanceof FormData) {
      headers.delete('Content-Type'); // Let browser set it with boundary
    } else if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return originalFetch(input, {
      ...init,
      headers
    });
  }

  return originalFetch(input, init);
};

export {};
