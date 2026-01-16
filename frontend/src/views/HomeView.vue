<template>
  <div class="home-view">
    <header class="app-header">
      <h1>QR Nest 文档管理系统</h1>
      <div class="header-actions">
        <button class="create-btn" @click="showCreateDialog = true">
          创建新文档
        </button>
      </div>
    </header>

    <main class="app-main">
      <aside class="sidebar">
        <FileList
          @document-click="handleDocumentClick"
          @edit-document="handleEditDocument"
          @delete-document="handleDeleteDocument"
          @create-document="showCreateDialog = true"
        />
      </aside>

      <section class="main-content">
        <Preview
          :document="currentDocument"
          :content="currentDocumentContent"
          @edit="handleEditDocument(currentDocument)"
          @build="handleBuild"
          @create-document="showCreateDialog = true"
        />
      </section>
    </main>

    <!-- 创建文档对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <div class="dialog" @click.stop>
        <h2>创建新文档</h2>
        <div class="dialog-content">
          <div class="form-group">
            <label for="new-title">文档标题：</label>
            <input
              id="new-title"
              v-model="newDocument.title"
              type="text"
              placeholder="请输入文档标题"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="new-category">分类：</label>
            <select
              id="new-category"
              v-model="newDocument.category"
              class="form-select"
            >
              <option value="">未分类</option>
              <option v-for="category in categories" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showCreateDialog = false">取消</button>
          <button class="confirm-btn" @click="handleCreateDocument">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import FileList from '../components/FileList.vue';
import Preview from '../components/Preview.vue';
import { documentApi, buildApi } from '../api';
import { store } from '../store';

const showCreateDialog = ref(false);
const currentDocument = ref(store.currentDocument);
const currentDocumentContent = ref('');
const categories = ref(store.categories);

const newDocument = ref({
  title: '',
  category: '',
});

// 加载文档内容
const loadDocumentContent = async (document: any) => {
  if (!document) return;
  
  try {
    const res = await documentApi.getDocumentContent(document.filePath);
    currentDocumentContent.value = res.data.data.content;
  } catch (error) {
    console.error('加载文档内容失败:', error);
    currentDocumentContent.value = '';
  }
};

// 处理文档点击
const handleDocumentClick = async (document: any) => {
  currentDocument.value = document;
  store.setCurrentDocument(document);
  await loadDocumentContent(document);
};

// 处理编辑文档
const handleEditDocument = (document: any) => {
  if (!document) return;
  store.setCurrentDocument(document);
  loadDocumentContent(document);
  // 跳转到编辑页面
  window.location.hash = `#/edit/${encodeURIComponent(document.filePath)}`;
};

// 处理删除文档
const handleDeleteDocument = async (document: any) => {
  if (!confirm(`确定要删除文档 "${document.title}" 吗？`)) {
    return;
  }
  
  try {
    await documentApi.deleteDocument(document.filePath);
    // 刷新文档列表
    window.location.reload();
  } catch (error) {
    console.error('删除文档失败:', error);
    alert('删除文档失败，请重试');
  }
};

// 处理创建文档
const handleCreateDocument = async () => {
  if (!newDocument.value.title.trim()) {
    alert('请输入文档标题');
    return;
  }
  
  try {
    await documentApi.createDocument({
      title: newDocument.value.title.trim(),
      category: newDocument.value.category,
      content: '# ' + newDocument.value.title.trim() + '\n\n这是一个新文档。',
    });
    
    showCreateDialog.value = false;
    // 刷新页面
    window.location.reload();
  } catch (error) {
    console.error('创建文档失败:', error);
    alert('创建文档失败，请重试');
  }
};

// 处理重新构建
const handleBuild = async () => {
  try {
    await buildApi.triggerBuild();
    alert('构建任务已触发');
  } catch (error) {
    console.error('触发构建失败:', error);
    alert('触发构建失败，请重试');
  }
};

// 组件挂载时初始化
onMounted(() => {
  // 如果当前有选中的文档，加载其内容
  if (currentDocument.value) {
    loadDocumentContent(currentDocument.value);
  }
});
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #409eff;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.create-btn {
  padding: 0.6rem 1.2rem;
  background-color: white;
  color: #409eff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.create-btn:hover {
  background-color: #ecf5ff;
  color: #66b1ff;
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 350px;
  background-color: white;
  border-right: 1px solid #eee;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.main-content {
  flex: 1;
  overflow: hidden;
  padding: 1rem;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dialog h2 {
  margin: 0;
  padding: 1.5rem;
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.dialog-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #606266;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #409eff;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: #fafafa;
  border-top: 1px solid #eee;
}

.cancel-btn, .confirm-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: #909399;
  color: white;
}

.cancel-btn:hover {
  background-color: #a6a9ad;
}

.confirm-btn {
  background-color: #67c23a;
  color: white;
}

.confirm-btn:hover {
  background-color: #85ce61;
}
</style>
