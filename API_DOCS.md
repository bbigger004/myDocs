# 文档管理系统 API 文档

## 1. 基本信息

### 1.1 Base URL
```
http://localhost:8080/api
```

### 1.2 响应格式

所有 API 响应均采用统一格式：

```json
{
  "code": 200,       // HTTP 状态码
  "message": "Success",  // 响应消息
  "data": {}         // 响应数据
}
```

### 1.3 错误处理

错误响应格式：

```json
{
  "code": 404,       // 错误状态码
  "message": "Document not found",  // 错误消息
  "data": null       // 错误数据
}
```

常见错误码：
- `400`: 请求参数错误
- `404`: 资源不存在
- `409`: 资源冲突（如分类已存在）
- `500`: 服务器内部错误

## 2. 文件管理 API

### 2.1 获取文档列表

**请求方法**: GET
**请求路径**: `/files`
**请求参数**:
| 参数名 | 类型 | 可选 | 描述 |
| ------ | ---- | ---- | ---- |
| category | string | 是 | 文档分类 |
| page | number | 是 | 页码，默认 1 |
| size | number | 是 | 每页大小，默认 10 |
| sortBy | string | 是 | 排序字段，默认 updatedAt |
| order | string | 是 | 排序方向，asc 或 desc，默认 desc |
| keyword | string | 是 | 搜索关键词 |

**响应数据**:
```json
{
  "list": [
    {
      "id": "string",
      "title": "string",
      "category": "string",
      "filePath": "string",
      "createdAt": "2026-01-16T08:00:00.000Z",
      "updatedAt": "2026-01-16T08:00:00.000Z",
      "size": 1024
    }
  ],
  "total": 100
}
```

### 2.2 获取文档内容

**请求方法**: GET
**请求路径**: `/files/:filename`
**请求参数**:
| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| filename | string | 文档文件名 |

**响应数据**:
```json
{
  "content": "# 文档标题\n文档内容",
  "metadata": {
    "id": "string",
    "title": "string",
    "category": "string",
    "filePath": "string",
    "createdAt": "2026-01-16T08:00:00.000Z",
    "updatedAt": "2026-01-16T08:00:00.000Z",
    "size": 1024
  }
}
```

### 2.3 创建文档

**请求方法**: POST
**请求路径**: `/files`
**请求体**:
```json
{
  "title": "文档标题",
  "category": "分类名称",
  "content": "# 文档标题\n文档内容"
}
```

**响应数据**:
```json
{
  "id": "string",
  "title": "string",
  "category": "string",
  "filePath": "string",
  "createdAt": "2026-01-16T08:00:00.000Z",
  "updatedAt": "2026-01-16T08:00:00.000Z",
  "size": 1024
}
```

### 2.4 更新文档

**请求方法**: PUT
**请求路径**: `/files/:filename`
**请求参数**:
| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| filename | string | 文档文件名 |

**请求体**:
```json
{
  "content": "# 更新后的文档标题\n更新后的文档内容"
}
```

**响应数据**:
```json
{
  "id": "string",
  "title": "string",
  "category": "string",
  "filePath": "string",
  "createdAt": "2026-01-16T08:00:00.000Z",
  "updatedAt": "2026-01-16T08:00:00.000Z",
  "size": 1024
}
```

### 2.5 删除文档

**请求方法**: DELETE
**请求路径**: `/files/:filename`
**请求参数**:
| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| filename | string | 文档文件名 |

**响应数据**:
```json
{
  "success": true
}
```

### 2.6 批量删除文档

**请求方法**: POST
**请求路径**: `/files/batch-delete`
**请求体**:
```json
{
  "filenames": ["file1.md", "file2.md"]
}
```

**响应数据**:
```json
{
  "success": true,
  "deletedCount": 2
}
```

### 2.7 搜索文档

**请求方法**: GET
**请求路径**: `/files/search`
**请求参数**:
| 参数名 | 类型 | 可选 | 描述 |
| ------ | ---- | ---- | ---- |
| keyword | string | 否 | 搜索关键词 |
| category | string | 是 | 文档分类 |

**响应数据**:
```json
{
  "list": [
    {
      "id": "string",
      "title": "string",
      "category": "string",
      "filePath": "string",
      "createdAt": "2026-01-16T08:00:00.000Z",
      "updatedAt": "2026-01-16T08:00:00.000Z",
      "size": 1024
    }
  ],
  "total": 10
}
```

## 3. 分类管理 API

### 3.1 获取分类列表

**请求方法**: GET
**请求路径**: `/files/categories`

**响应数据**:
```json
[
  {
    "id": "string",
    "name": "分类名称",
    "description": "分类描述",
    "order": 1,
    "documentCount": 10,
    "createdAt": "2026-01-16T08:00:00.000Z",
    "updatedAt": "2026-01-16T08:00:00.000Z"
  }
]
```

### 3.2 创建分类

**请求方法**: POST
**请求路径**: `/files/categories`
**请求体**:
```json
{
  "name": "新分类",
  "description": "分类描述"
}
```

**响应数据**:
```json
{
  "id": "string",
  "name": "新分类",
  "description": "分类描述",
  "order": 2,
  "documentCount": 0,
  "createdAt": "2026-01-16T08:00:00.000Z",
  "updatedAt": "2026-01-16T08:00:00.000Z"
}
```

### 3.3 更新分类

**请求方法**: PUT
**请求路径**: `/files/categories/:id`
**请求参数**:
| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| id | string | 分类ID |

**请求体**:
```json
{
  "name": "更新后的分类名",
  "description": "更新后的分类描述"
}
```

**响应数据**:
```json
{
  "id": "string",
  "name": "更新后的分类名",
  "description": "更新后的分类描述",
  "order": 2,
  "documentCount": 10,
  "createdAt": "2026-01-16T08:00:00.000Z",
  "updatedAt": "2026-01-16T08:00:00.000Z"
}
```

### 3.4 删除分类

**请求方法**: DELETE
**请求路径**: `/files/categories/:name`
**请求参数**:
| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| name | string | 分类名称 |

**响应数据**:
```json
{
  "success": true
}
```

### 3.5 排序分类

**请求方法**: POST
**请求路径**: `/files/categories/sort`
**请求体**:
```json
{
  "ids": ["category1", "category2", "category3"]
}
```

**响应数据**:
```json
{
  "success": true
}
```

## 4. 构建管理 API

### 4.1 触发构建

**请求方法**: POST
**请求路径**: `/build`

**响应数据**:
```json
{
  "id": "string",
  "status": "pending",
  "progress": 0,
  "message": "Waiting for build to start",
  "documentCount": 10
}
```

### 4.2 获取构建状态

**请求方法**: GET
**请求路径**: `/build/status`
**请求参数**:
| 参数名 | 类型 | 可选 | 描述 |
| ------ | ---- | ---- | ---- |
| taskId | string | 是 | 构建任务ID，不提供则获取当前状态 |

**响应数据**:
```json
{
  "status": "building",
  "progress": 50,
  "message": "Converting Markdown to HTML...",
  "activeTask": {
    "id": "string",
    "status": "building",
    "startTime": "2026-01-16T08:00:00.000Z",
    "progress": 50,
    "message": "Converting Markdown to HTML...",
    "documentCount": 10
  }
}
```

### 4.3 获取构建历史

**请求方法**: GET
**请求路径**: `/build/history`
**请求参数**:
| 参数名 | 类型 | 可选 | 描述 |
| ------ | ---- | ---- | ---- |
| page | number | 是 | 页码，默认 1 |
| size | number | 是 | 每页大小，默认 10 |

**响应数据**:
```json
{
  "list": [
    {
      "id": "string",
      "taskId": "string",
      "status": "success",
      "startTime": "2026-01-16T08:00:00.000Z",
      "endTime": "2026-01-16T08:05:00.000Z",
      "duration": 300000,
      "message": "Build completed successfully",
      "documentCount": 10
    }
  ],
  "total": 5
}
```

### 4.4 取消构建

**请求方法**: POST
**请求路径**: `/build/cancel`
**请求体**:
```json
{
  "taskId": "string"
}
```

**响应数据**:
```json
{
  "success": true
}
```

## 5. WebSocket API

### 5.1 连接信息

**连接 URL**: `ws://localhost:8080`

### 5.2 事件列表

#### 5.2.1 连接成功
**事件名**: `connected`
**事件数据**: `{ message: "Connected to server" }`

#### 5.2.2 构建开始
**事件名**: `build:start`
**事件数据**:
```json
{
  "taskId": "string",
  "status": "building",
  "startTime": "2026-01-16T08:00:00.000Z",
  "progress": 0,
  "message": "Starting build process...",
  "documentCount": 10
}
```

#### 5.2.3 构建进度
**事件名**: `build:progress`
**事件数据**:
```json
{
  "taskId": "string",
  "progress": 50,
  "message": "Converting Markdown to HTML..."
}
```

#### 5.2.4 构建完成
**事件名**: `build:complete`
**事件数据**:
```json
{
  "taskId": "string",
  "status": "success",
  "endTime": "2026-01-16T08:05:00.000Z",
  "duration": 300000,
  "message": "Build completed successfully",
  "documentCount": 10
}
```

#### 5.2.5 文件变更
**事件名**: `file:change`
**事件数据**:
```json
{
  "filename": "file.md",
  "event": "created",
  "timestamp": "2026-01-16T08:00:00.000Z"
}
```

## 6. 示例请求

### 6.1 使用 curl 请求文档列表

```bash
curl -X GET "http://localhost:8080/api/files?page=1&size=10&sortBy=updatedAt&order=desc"
```

### 6.2 使用 curl 创建文档

```bash
curl -X POST "http://localhost:8080/api/files" \
  -H "Content-Type: application/json" \
  -d '{"title": "测试文档", "category": "未分类", "content": "# 测试文档\n这是一个测试文档内容"}'
```

## 7. WebSocket 连接示例

```javascript
const socket = io('http://localhost:8080');

// 连接成功
socket.on('connected', () => {
  console.log('Connected to WebSocket server');
});

// 构建进度更新
socket.on('build:progress', (data) => {
  console.log('Build progress:', data.progress, '%', data.message);
});

// 构建完成
socket.on('build:complete', (data) => {
  console.log('Build completed:', data.status, data.message);
});
```

## 8. 状态码说明

| 状态码 | 描述 |
| ------ | ---- |
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

## 9. 附录

### 9.1 文档对象结构

```json
{
  "id": "string",
  "title": "string",
  "category": "string",
  "filePath": "string",
  "createdAt": "2026-01-16T08:00:00.000Z",
  "updatedAt": "2026-01-16T08:00:00.000Z",
  "size": 1024,
  "content": "# 文档内容"
}
```

### 9.2 分类对象结构

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "order": 1,
  "documentCount": 10,
  "createdAt": "2026-01-16T08:00:00.000Z",
  "updatedAt": "2026-01-16T08:00:00.000Z"
}
```

### 9.3 构建任务对象结构

```json
{
  "id": "string",
  "status": "pending" | "building" | "success" | "failed" | "cancelled",
  "startTime": "2026-01-16T08:00:00.000Z",
  "endTime": "2026-01-16T08:05:00.000Z",
  "duration": 300000,
  "progress": 100,
  "message": "Build completed successfully",
  "documentCount": 10
}
```

### 9.4 构建历史对象结构

```json
{
  "id": "string",
  "taskId": "string",
  "status": "success" | "failed" | "cancelled",
  "startTime": "2026-01-16T08:00:00.000Z",
  "endTime": "2026-01-16T08:05:00.000Z",
  "duration": 300000,
  "message": "Build completed successfully",
  "documentCount": 10
}
```
