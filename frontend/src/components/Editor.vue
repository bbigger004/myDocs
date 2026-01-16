<template>
  <div class="editor-container">
    <div class="editor-header">
      <h2>{{ isNew ? '创建新文档' : '编辑文档' }}</h2>
      <div class="editor-actions">
        <button class="action-btn save-btn" @click="handleSave">
          保存
        </button>
        <button class="action-btn cancel-btn" @click="handleCancel">
          取消
        </button>
      </div>
    </div>

    <div class="editor-main">
      <div class="editor-panel">
        <div class="editor-title">
          <label for="document-title">文档标题：</label>
          <input
            id="document-title"
            v-model="documentTitle"
            type="text"
            placeholder="请输入文档标题"
            class="title-input"
          />
        </div>
        
        <div class="editor-category">
          <label for="document-category">分类：</label>
          <select
            id="document-category"
            v-model="documentCategory"
            class="category-select"
          >
            <option value="">未分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.name">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div ref="editorContainer" class="editor"></div>
      </div>

      <div class="preview-panel" v-if="showPreview">
        <h3>实时预览</h3>
        <div class="preview-content" v-html="previewHtml"></div>
      </div>
    </div>

    <div class="editor-footer">
      <div class="status-bar">
        <span>{{ isSaving ? '保存中...' : '已保存' }}</span>
        <span>{{ wordCount }} 字</span>
      </div>
      <div class="preview-toggle">
        <label>
          <input
            type="checkbox"
            v-model="showPreview"
            class="preview-checkbox"
          />
          显示实时预览
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue';
import * as monaco from 'monaco-editor';
import markdownit from 'markdown-it';
import { documentApi } from '../api';
import { store } from '../store';

const props = defineProps<{
  document?: any;
  isNew?: boolean;
}>();

const emit = defineEmits(['save', 'cancel']);

// 编辑器相关
const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
const documentTitle = ref(props.document?.title || '');
const documentCategory = ref(props.document?.category || '');
const isSaving = ref(false);
const showPreview = ref(true);
const md = markdownit({
  html: true,
  breaks: true,
  linkify: true,
});

// 实时预览
const previewHtml = ref('');

// 获取分类列表
const categories = ref(store.categories);

// 计算字数
const wordCount = computed(() => {
  const content = editor?.getValue() || '';
  return content.length;
});

// 初始化编辑器
const initEditor = async () => {
  await nextTick();
  if (!editorContainer.value) return;

  // 创建编辑器
  editor = monaco.editor.create(editorContainer.value, {
    value: props.document?.content || '',
    language: 'markdown',
    theme: 'vs-light',
    automaticLayout: true,
    minimap: {
      enabled: true,
    },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    wordWrap: 'on',
  });

  // 监听内容变化，更新实时预览
  editor.onDidChangeModelContent(() => {
    updatePreview();
  });

  // 初始更新预览
  updatePreview();
};

// 更新实时预览
const updatePreview = () => {
  if (!editor) return;
  const content = editor.getValue();
  previewHtml.value = md.render(content);
};

// 保存文档
const handleSave = async () => {
  if (!documentTitle.value.trim()) {
    alert('请输入文档标题');
    return;
  }

  isSaving.value = true;

  try {
    const content = editor?.getValue() || '';
    const docData = {
      title: documentTitle.value.trim(),
      category: documentCategory.value,
      content,
    };

    let result;
    if (props.isNew) {
      // 创建新文档
      result = await documentApi.createDocument(docData);
    } else if (props.document) {
      // 更新现有文档
      result = await documentApi.updateDocument(props.document.filePath, { content });
    }

    emit('save', result?.data?.data);
  } catch (error) {
    console.error('保存文档失败:', error);
    alert('保存文档失败，请重试');
  } finally {
    isSaving.value = false;
  }
};

// 取消编辑
const handleCancel = () => {
  emit('cancel');
};

// 组件挂载时初始化编辑器
onMounted(() => {
  initEditor();
});

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  editor?.dispose();
});

// 监听文档变化，更新编辑器内容
watch(
  () => props.document,
  (newDoc) => {
    if (newDoc && editor) {
      documentTitle.value = newDoc.title;
      documentCategory.value = newDoc.category;
      editor.setValue(newDoc.content || '');
      updatePreview();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #eee;
}

.editor-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.editor-actions {
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

.save-btn {
  background-color: #67c23a;
  color: white;
}

.save-btn:hover {
  background-color: #85ce61;
}

.cancel-btn {
  background-color: #909399;
  color: white;
}

.cancel-btn:hover {
  background-color: #a6a9ad;
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 1rem;
  overflow: hidden;
}

.editor-title, .editor-category {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.editor-title label, .editor-category label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.title-input, .category-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0.9rem;
}

.title-input:focus, .category-select:focus {
  outline: none;
  border-color: #409eff;
}

.editor {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.preview-panel {
  width: 50%;
  padding: 1rem;
  background-color: white;
  border-left: 1px solid #eee;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.preview-panel h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #333;
}

.preview-content {
  flex: 1;
  padding: 1rem;
  background-color: #fafafa;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow-y: auto;
}

.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.preview-content p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.preview-content ul,
.preview-content ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.preview-content li {
  margin: 0.25rem 0;
}

.preview-content code {
  background-color: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

.preview-content pre {
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.preview-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.preview-content blockquote {
  border-left: 4px solid #409eff;
  margin: 0.5rem 0;
  padding-left: 1rem;
  color: #606266;
  font-style: italic;
}

.preview-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5rem 0;
}

.preview-content th,
.preview-content td {
  border: 1px solid #dcdfe6;
  padding: 0.5rem;
  text-align: left;
}

.preview-content th {
  background-color: #f5f7fa;
  font-weight: 600;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f5f7fa;
  border-top: 1px solid #eee;
  font-size: 0.8rem;
  color: #606266;
}

.status-bar {
  display: flex;
  gap: 1rem;
}

.preview-toggle {
  display: flex;
  align-items: center;
}

.preview-checkbox {
  margin-right: 0.5rem;
}
</style>
