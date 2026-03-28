import axios from 'axios';

const API = axios.create({ baseURL: 'https://egf-library-backend.onrender.com/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// Books
export const getBooks = () => API.get('/books');
export const getBook = (id) => API.get(`/books/${id}`);
export const searchBooks = (query) => API.get(`/books/search?query=${query}`);
export const createBook = (data) => API.post('/books', data);
export const updateBook = (id, data) => API.put(`/books/${id}`, data);
export const deleteBook = (id) => API.delete(`/books/${id}`);

// Members
export const getMembers = () => API.get('/members');
export const getMember = (id) => API.get(`/members/${id}`);
export const searchMembers = (query) => API.get(`/members/search?query=${query}`);
export const createMember = (data) => API.post('/members', data);
export const updateMember = (id, data) => API.put(`/members/${id}`, data);
export const deleteMember = (id) => API.delete(`/members/${id}`);

// Issues
export const getAllIssues = () => API.get('/issues');
export const getActiveIssues = () => API.get('/issues/active');
export const getOverdueIssues = () => API.get('/issues/overdue');
export const issueBook = (data) => API.post('/issues/issue', data);
export const returnBook = (issueId, data) => API.put(`/issues/return/${issueId}`, data);
export const getStats = () => API.get('/issues/stats');

export default API;
