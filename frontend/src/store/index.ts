import { reactive } from 'vue';

// 文档接口定义
export interface Document {
  id: string;
  title: string;
  category: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
  size: number;
  content?: string;
}

// 分类接口定义
export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  documentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 构建任务接口定义
export interface BuildTask {
  id: string;
  status: 'pending' | 'building' | 'success' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  progress: number;
  message: string;
  documentCount: number;
}

// 构建状态接口定义
export interface BuildStatus {
  status: 'idle' | 'building' | 'success' | 'failed';
  progress: number;
  message: string;
  activeTask?: BuildTask;
}

// 全局状态
export const store = reactive({
  // 文档相关
  documents: [] as Document[],
  currentDocument: null as Document | null,
  documentContent: '',
  isEditing: false,
  
  // 分类相关
  categories: [] as Category[],
  currentCategory: '',
  
  // 构建相关
  buildStatus: {
    status: 'idle' as 'idle' | 'building' | 'success' | 'failed',
    progress: 0,
    message: 'No active build tasks',
    activeTask: undefined
  } as BuildStatus,
  buildHistory: [] as BuildTask[],
  
  // UI相关
  searchKeyword: '',
  isLoading: false,
  error: null as string | null,
  
  // WebSocket相关
  isWebSocketConnected: false,
  

  
  // 设置文档列表
  setDocuments(documents: Document[]) {
    this.documents = documents;
  },
  
  // 设置当前文档
  setCurrentDocument(document: Document | null) {
    this.currentDocument = document;
  },
  
  // 设置文档内容
  setDocumentContent(content: string) {
    this.documentContent = content;
  },
  
  // 设置编辑状态
  setIsEditing(isEditing: boolean) {
    this.isEditing = isEditing;
  },
  
  // 设置分类列表
  setCategories(categories: Category[]) {
    this.categories = categories;
  },
  
  // 设置当前分类
  setCurrentCategory(category: string) {
    this.currentCategory = category;
  },
  
  // 设置构建状态
  setBuildStatus(status: BuildStatus) {
    this.buildStatus = status;
  },
  
  // 设置构建历史
  setBuildHistory(history: BuildTask[]) {
    this.buildHistory = history;
  },
  
  // 设置搜索关键词
  setSearchKeyword(keyword: string) {
    this.searchKeyword = keyword;
  },
  
  // 设置加载状态
  setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  },
  
  // 设置错误信息
  setError(error: string | null) {
    this.error = error;
  },
  
  // 设置WebSocket连接状态
  setIsWebSocketConnected(connected: boolean) {
    this.isWebSocketConnected = connected;
  },
  
  // 重置搜索状态
  resetSearch() {
    this.searchKeyword = '';
    this.currentCategory = '';
  },
});
