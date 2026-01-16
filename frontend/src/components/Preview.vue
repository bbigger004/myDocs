<template>
  <div class="preview-container">
    <div class="preview-header">
      <h2>文档预览</h2>
      <div class="preview-actions">
        <button class="action-btn edit-btn" @click="$emit('edit')">
          编辑文档
        </button>
        <button class="action-btn build-btn" @click="$emit('build')">
          重新构建
        </button>
      </div>
    </div>

    <div class="preview-content" v-if="document">
      <div class="document-meta">
        <h1>{{ document.title }}</h1>
        <div class="meta-info">
          <span class="category">分类：{{ document.category || '未分类' }}</span>
          <span class="date">更新时间：{{ formatDate(document.updatedAt) }}</span>
          <span class="size">大小：{{ formatSize(document.size) }}</span>
        </div>
      </div>
      
      <div class="document-content" v-html="htmlContent"></div>
    </div>
    
    <div class="empty-state" v-else>
      <p>请选择一个文档进行预览</p>
      <button class="create-btn" @click="$emit('create-document')">
        创建新文档
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import markdownit from 'markdown-it';

const props = defineProps<{
  document?: any;
  content?: string;
}>();

const emit = defineEmits(['edit', 'build', 'create-document']);

const md = markdownit({
  html: true,
  breaks: true,
  linkify: true,
});

const htmlContent = computed(() => {
  if (props.content) {
    return md.render(props.content);
  }
  return '';
});

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
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #eee;
}

.preview-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.edit-btn {
  background-color: #409eff;
  color: white;
}

.edit-btn:hover {
  background-color: #66b1ff;
}

.build-btn {
  background-color: #e6a23c;
  color: white;
}

.build-btn:hover {
  background-color: #ebb563;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  background-color: white;
  padding: 2rem;
}

.document-meta {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.document-meta h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: #333;
}

.meta-info {
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
  color: #666;
}

.document-content {
  line-height: 1.8;
  color: #303133;
}

.document-content h1,
.document-content h2,
.document-content h3,
.document-content h4,
.document-content h5,
.document-content h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.2;
}

.document-content h1 { font-size: 1.8rem; }
.document-content h2 { font-size: 1.6rem; }
.document-content h3 { font-size: 1.4rem; }
.document-content h4 { font-size: 1.2rem; }
.document-content h5 { font-size: 1.1rem; }
.document-content h6 { font-size: 1rem; }

.document-content p {
  margin: 1rem 0;
}

.document-content ul,
.document-content ol {
  padding-left: 2rem;
  margin: 1rem 0;
}

.document-content li {
  margin: 0.5rem 0;
}

.document-content code {
  background-color: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

.document-content pre {
  background-color: #f0f0f0;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.document-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.9rem;
}

.document-content blockquote {
  border-left: 4px solid #409eff;
  margin: 1rem 0;
  padding: 1rem 1.5rem;
  color: #606266;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.document-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.document-content th,
.document-content td {
  border: 1px solid #dcdfe6;
  padding: 0.8rem;
  text-align: left;
}

.document-content th {
  background-color: #f5f7fa;
  font-weight: 600;
}

.document-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1rem 0;
}

.document-content hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 2rem 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
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
</style>
