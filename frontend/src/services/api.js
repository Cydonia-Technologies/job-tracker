// =====================================================
// API SERVICE (src/services/api.js)
// =====================================================

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.session?.access_token) {
      localStorage.setItem('authToken', response.data.session.access_token);
    }
    return response.data;
  }

  async register(userData) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async logout() {
    await this.api.post('/auth/logout');
    localStorage.removeItem('authToken');
  }

  // Job methods
  async getJobs(params = {}) {
    const response = await this.api.get('/jobs', { params });
    return response.data;
  }

  async getJob(id) {
    const response = await this.api.get(`/jobs/${id}`);
    return response.data;
  }

  async createJob(jobData) {
    const response = await this.api.post('/jobs', jobData);
    return response.data;
  }

  async updateJob(id, jobData) {
    const response = await this.api.put(`/jobs/${id}`, jobData);
    return response.data;
  }

  async deleteJob(id) {
    await this.api.delete(`/jobs/${id}`);
  }

  // Application methods
  async getApplications(params = {}) {
    const response = await this.api.get('/applications', { params });
    return response.data;
  }

  async createApplication(applicationData) {
    const response = await this.api.post('/applications', applicationData);
    return response.data;
  }

  async updateApplicationStatus(id, status) {
    const response = await this.api.patch(`/applications/${id}/status`, { status });
    return response.data;
  }

  // Stats methods
  async getJobStats() {
    const response = await this.api.get('/jobs/stats/summary');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;

