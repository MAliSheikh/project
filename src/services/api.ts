import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Add request timeout and better error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      error.message = 'Request timeout. Please check your connection.';
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - cannot reach server');
      error.message = 'Network Error: Cannot reach the server. Please ensure the backend is running.';
    } else if (!error.response) {
      console.error('No response received:', error.message);
      error.message = 'No response from server. Please check if the backend is running.';
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ChatResponse {
  question: string;
  answer: string;
  user: string;
}

export interface ChatHistoryItem {
  question: string;
  answer: string;
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not configured. Please check your .env file.');
  }
  
  const formData = new FormData();
  formData.append('grant_type', 'password');
  formData.append('username', email);
  formData.append('password', password);
  formData.append('scope', '');
  formData.append('client_id', 'string');
  formData.append('client_secret', '********');

  const response = await api.post('/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
};

export const getChatHistory = async (token: string): Promise<ChatHistoryItem[]> => {
  const response = await api.get('/chat_history/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const sendChatMessage = async (question: string, token: string): Promise<ChatResponse> => {
  const response = await api.get('/rag_query/', {
    params: { question },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};