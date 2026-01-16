import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// API配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const WS_URL = import.meta.env.VITE_WS_URL || '/';

// 创建Axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 创建WebSocket连接
const socket: Socket = io(WS_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// 监听WebSocket事件
const setupWebSocketListeners = (
  onConnected: () => void,
  onBuildStart: (data: any) => void,
  onBuildProgress: (data: any) => void,
  onBuildComplete: (data: any) => void,
  onFileChange: (data: any) => void
) => {
  socket.on('connected', onConnected);
  socket.on('build:start', onBuildStart);
  socket.on('build:progress', onBuildProgress);
  socket.on('build:complete', onBuildComplete);
  socket.on('file:change', onFileChange);
};

// 文档管理API
export const documentApi = {
  // 获取文档列表
  getDocuments: (params?: any) => apiClient.get('/files', { params }),
  
  // 获取文档内容
  getDocumentContent: (filename: string) => apiClient.get(`/files/${filename}`),
  
  // 创建文档
  createDocument: (data: any) => apiClient.post('/files', data),
  
  // 更新文档
  updateDocument: (filename: string, data: any) => apiClient.put(`/files/${filename}`, data),
  
  // 删除文档
  deleteDocument: (filename: string) => apiClient.delete(`/files/${filename}`),
  
  // 批量删除文档
  batchDeleteDocuments: (data: any) => apiClient.post('/files/batch-delete', data),
  
  // 搜索文档
  searchDocuments: (params: any) => apiClient.get('/files/search', { params }),
  
  // 获取分类列表
  getCategories: () => apiClient.get('/files/categories'),
  
  // 创建分类
  createCategory: (data: any) => apiClient.post('/files/categories', data),
  
  // 更新分类
  updateCategory: (id: string, data: any) => apiClient.put(`/files/categories/${id}`, data),
  
  // 删除分类
  deleteCategory: (name: string) => apiClient.delete(`/files/categories/${name}`),
  
  // 排序分类
  sortCategories: (data: any) => apiClient.post('/files/categories/sort', data),
};

// 构建管理API
export const buildApi = {
  // 触发构建
  triggerBuild: () => apiClient.post('/build'),
  
  // 获取构建状态
  getBuildStatus: (taskId?: string) => apiClient.get('/build/status', { params: { taskId } }),
  
  // 获取构建历史
  getBuildHistory: (params?: any) => apiClient.get('/build/history', { params }),
  
  // 取消构建
  cancelBuild: (taskId: string) => apiClient.post('/build/cancel', { taskId }),
};

export { apiClient, socket, setupWebSocketListeners };
