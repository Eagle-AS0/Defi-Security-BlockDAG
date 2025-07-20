import axios from 'axios';
import { config } from '../utils/config';

class MLService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getDetectionStatus() {
    try {
      const response = await this.apiClient.get('/api/ml/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get ML detection status:', error);
      throw error;
    }
  }

  async analyzeTransaction(txData) {
    try {
      const response = await this.apiClient.post('/api/ml/analyze', txData);
      return response.data;
    } catch (error) {
      console.error('Failed to analyze transaction:', error);
      throw error;
    }
  }

  async getDetectionHistory(limit = 100) {
    try {
      const response = await this.apiClient.get(`/api/ml/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get detection history:', error);
      throw error;
    }
  }

  async getModelMetrics() {
    try {
      const response = await this.apiClient.get('/api/ml/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to get model metrics:', error);
      throw error;
    }
  }

  async retrainModel() {
    try {
      const response = await this.apiClient.post('/api/ml/retrain');
      return response.data;
    } catch (error) {
      console.error('Failed to retrain model:', error);
      throw error;
    }
  }
}

export default new MLService();
