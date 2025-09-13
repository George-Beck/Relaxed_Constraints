const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Articles API
export const articlesApi = {
  getAll: async (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/articles?${params}`);
    if (!response.ok) throw new Error('Failed to fetch articles');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`);
    if (!response.ok) throw new Error('Failed to fetch article');
    return response.json();
  },

  create: async (article: any) => {
    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(article)
    });
    if (!response.ok) throw new Error('Failed to create article');
    return response.json();
  },

  update: async (id: string, article: any) => {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(article)
    });
    if (!response.ok) throw new Error('Failed to update article');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete article');
    return response.json();
  }
};

// Stocks API
export const stocksApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/stocks`);
    if (!response.ok) throw new Error('Failed to fetch stocks');
    return response.json();
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch stock');
    return response.json();
  },

  create: async (stock: any) => {
    const response = await fetch(`${API_BASE_URL}/stocks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stock)
    });
    if (!response.ok) throw new Error('Failed to create stock');
    return response.json();
  },

  update: async (id: number, stock: any) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stock)
    });
    if (!response.ok) throw new Error('Failed to update stock');
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/stocks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete stock');
    return response.json();
  }
};

// Economic Indicators API
export const indicatorsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/indicators`);
    if (!response.ok) throw new Error('Failed to fetch indicators');
    return response.json();
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/indicators/${id}`);
    if (!response.ok) throw new Error('Failed to fetch indicator');
    return response.json();
  },

  create: async (indicator: any) => {
    const response = await fetch(`${API_BASE_URL}/indicators`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(indicator)
    });
    if (!response.ok) throw new Error('Failed to create indicator');
    return response.json();
  },

  update: async (id: number, indicator: any) => {
    const response = await fetch(`${API_BASE_URL}/indicators/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(indicator)
    });
    if (!response.ok) throw new Error('Failed to update indicator');
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/indicators/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete indicator');
    return response.json();
  }
};

// Books API
export const booksApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) throw new Error('Failed to fetch books');
    return response.json();
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    if (!response.ok) throw new Error('Failed to fetch book');
    return response.json();
  },

  create: async (book: any) => {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(book)
    });
    if (!response.ok) throw new Error('Failed to create book');
    return response.json();
  },

  update: async (id: number, book: any) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(book)
    });
    if (!response.ok) throw new Error('Failed to update book');
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete book');
    return response.json();
  }
};

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status} ${errorText}`);
    }
    return response.json();
  },

  verify: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (!response.ok) throw new Error('Token verification failed');
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
  }
};
