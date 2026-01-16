<template>
  <div class="edit-view">
    <Editor
      :document="currentDocument"
      :is-new="isNew"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Editor from '../components/Editor.vue';
import { documentApi } from '../api';
import { store } from '../store';

const route = useRoute();
const router = useRouter();
const currentDocument = ref<any>(null);
const isLoading = ref(false);

// 判断是否为新建文档
const isNew = computed(() => {
  return route.params.filePath === 'new';
});

// 加载文档数据
const loadDocument = async () => {
  if (isNew.value) {
    // 新建文档，初始化空文档
    currentDocument.value = {
      title: '',
      category: '',
      content: '',
    };
    return;
  }

  isLoading.value = true;
  const filePath = route.params.filePath as string;
  
  try {
    const res = await documentApi.getDocumentContent(filePath);
    const content = res.data.data.content;
    
    // 获取文档元数据
    const documents = store.documents;
    const doc = documents.find(d => d.filePath === filePath);
    
    if (doc) {
      currentDocument.value = {
        ...doc,
        content,
      };
    } else {
      // 如果在 store 中找不到，尝试从后端获取所有文档
      const docsRes = await documentApi.getDocuments();
      const allDocs = docsRes.data.data.list;
      const foundDoc = allDocs.find((d: any) => d.filePath === filePath);
      
      if (foundDoc) {
        currentDocument.value = {
          ...foundDoc,
          content,
        };
      }
    }
  } catch (error) {
    console.error('加载文档失败:', error);
    alert('加载文档失败，请重试');
    router.push('/');
  } finally {
    isLoading.value = false;
  }
};

// 处理保存
const handleSave = async (savedDoc: any) => {
  // 保存成功后返回首页
  router.push('/');
};

// 处理取消
const handleCancel = () => {
  router.push('/');
};

// 组件挂载时加载文档
onMounted(() => {
  loadDocument();
});
</script>

<style scoped>
.edit-view {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>