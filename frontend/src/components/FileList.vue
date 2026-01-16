<template>
  <div class="file-list">
    <div class="file-list-header">
      <h2>文档列表</h2>
      <div class="search-bar">
        <input
          type="text"
          v-model="store.searchKeyword"
          placeholder="搜索文档..."
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="categories">
      <button
        v-for="category in store.categories"
        :key="category.id"
        :class="['category-btn', { active: store.currentCategory === category.name }]"
        @click="handleCategoryChange(category.name)"
      >
        {{ category.name }} ({{ category.documentCount }})
      </button>
    </div>

    <div class="documents-container">
      <div class="document-item" v-for="doc in store.documents" :key="doc.id">
        <div class="document-info" @click="handleDocumentClick(doc)">
          <h3 class="document-title">{{ doc.title }}</h3>
          <div class="document-meta">
            <span class="category">{{ doc.category }}</span>
            <span class="date">{{ formatDate(doc.updatedAt) }}</span>
            <span class="size">{{ formatSize(doc.size) }}</span>
          </div>
        </div>
        <div class="document-actions">
          <button class="action-btn edit-btn" @click="handleEdit(doc)">
            编辑
          </button>
          <button class="action-btn delete-btn" @click="handleDelete(doc)">
            删除
          </button>
        </div>
      </div>

      <div v-if="store.documents.length === 0" class="empty-state">
        <p>暂无文档</p>
        <button class="create-btn" @click="$emit('create-document')">
          创建新文档
        </button>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { store } from '../store';
import { documentApi } from '../api';
import { onMounted, computed } from 'vue';

const emit = defineEmits(['document-click', 'edit-document', 'delete-document', 'create-document']);



// 初始化数据
const initData = async () => {
  store.isLoading = true;
  try {
    // 获取分类列表
    const categoriesRes = await documentApi.getCategories();
    store.setCategories(categoriesRes.data.data);

    // 获取文档列表
    await fetchDocuments();
  } catch (error) {
    store.setError((error as Error).message);
  } finally {
    store.isLoading = false;
  }
};

// 获取文档列表
const fetchDocuments = async () => {
  store.isLoading = true;
  try {
    const params = {
      category: store.currentCategory || undefined,
      keyword: store.searchKeyword || undefined
    };

    const res = await documentApi.getDocuments(params);
    store.setDocuments(res.data.data.list);
  } catch (error) {
    store.setError((error as Error).message);
  } finally {
    store.isLoading = false;
  }
};

// 处理分类切换
const handleCategoryChange = (category: string) => {
  store.setCurrentCategory(category === store.currentCategory ? '' : category);
  fetchDocuments();
};

// 处理搜索
const handleSearch = () => {
  fetchDocuments();
};

// 处理文档点击
const handleDocumentClick = (doc: any) => {
  emit('document-click', doc);
};

// 处理编辑
const handleEdit = (doc: any) => {
  emit('edit-document', doc);
};

// 处理删除
const handleDelete = (doc: any) => {
  emit('delete-document', doc);
};



// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

// 格式化文件大小
const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
};

// 组件挂载时初始化数据
onMounted(() => {
  initData();
});
</script>

<style scoped>
.file-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.file-list-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.search-bar {
  flex: 1;
  max-width: 300px;
  margin-left: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.category-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.category-btn:hover {
  background-color: #f0f0f0;
}

.category-btn.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.documents-container {
  flex: 1;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.document-item:last-child {
  border-bottom: none;
}

.document-item:hover {
  background-color: #fafafa;
}

.document-info {
  flex: 1;
  cursor: pointer;
}

.document-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.document-item:hover .document-actions {
  opacity: 1;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.edit-btn {
  background-color: #409eff;
  color: white;
}

.edit-btn:hover {
  background-color: #66b1ff;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
}

.delete-btn:hover {
  background-color: #f78989;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
}

.create-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid #409eff;
  border-radius: 4px;
  background-color: white;
  color: #409eff;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background-color: #409eff;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}
</style>
