import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Document, Category, DocumentQuery, CreateDocumentDto, UpdateDocumentDto, BatchDeleteDto } from './file.interface';
import { DOCS_DIR, FILE_EXTENSION, DEFAULT_PAGE_SIZE } from '../common/constants';
import { ensureDir, generateId, formatDate, getFileNameWithoutExt, readDirRecursive } from '../common/utils';

@Injectable()
export class FileService {
  private readonly docsDir = DOCS_DIR;

  constructor() {
    // 确保docs目录存在
    ensureDir(this.docsDir);
  }

  /**
   * 获取文档列表
   */
  async getDocuments(query: DocumentQuery): Promise<{ list: Document[]; total: number }> {
    const { category, keyword } = query;
    
    // 读取所有文档文件
    const allFiles = readDirRecursive(this.docsDir);
    let markdownFiles = allFiles.filter(file => path.extname(file).toLowerCase() === FILE_EXTENSION);
    
    // 读取分类配置
    const docsConfig = this.readDocsConfig();
    
    // 按分类过滤
    if (category) {
      // 查找匹配的分类组
      const foundCategoryGroup = docsConfig.categories.find(group => group.name === category);
      
      if (foundCategoryGroup) {
        // 获取该分类组下的所有文档类型路径
        const documentTypePaths = foundCategoryGroup.links.map(link => link.path);
        
        // 过滤出属于这些文档类型的文档
        markdownFiles = markdownFiles.filter(file => {


          const relativePath = getFileNameWithoutExt(path.basename(file));
          return documentTypePaths.includes(relativePath);
        });
      } else {
        // 如果分类不存在，返回空列表
        markdownFiles = [];
      }
    }
    
    // 按关键词过滤
    if (keyword) {
      markdownFiles = markdownFiles.filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        const title = getFileNameWithoutExt(path.basename(file));
        return title.includes(keyword) || content.includes(keyword);
      });
    }
    
    // 转换为Document对象
    let documents: Document[] = markdownFiles.map(file => {
      const stats = fs.statSync(file);
      const relativePath = path.relative(this.docsDir, file);
      const dirPath = path.dirname(relativePath);
      
      // 根据文件路径查找对应的分类组名称
      let categoryName = '未分类';
      
      // 查找对应的分类组名称
      for (const categoryGroup of docsConfig.categories) {
        // 遍历该分类组下的所有链接
        for (const link of categoryGroup.links) {
          // 检查文件路径是否包含该链接的路径
          if (relativePath.startsWith(`${link.path}/`) || relativePath === `${link.path}${FILE_EXTENSION}`) {
            categoryName = categoryGroup.name;
            break;
          }
        }
        if (categoryName !== '未分类') {
          break;
        }
      }
      
      return {
        id: generateId(),
        title: getFileNameWithoutExt(path.basename(file)),
        category: categoryName,
        filePath: relativePath,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        size: stats.size
      };
    });
    
    // 按更新时间倒序排序
    documents.sort((a, b) => {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
    
    return {
      list: documents,
      total: documents.length
    };
  }

  /**
   * 获取单个文档内容
   */
  async getDocumentContent(filename: string): Promise<{ content: string; metadata: Document }> {
    const filePath = path.join(this.docsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Document not found');
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    
    // 读取分类配置
    const docsConfig = this.readDocsConfig();
    
    // 根据文件路径查找对应的分类组名称
    let categoryName = '未分类';
    
    // 查找对应的分类组名称
    for (const categoryGroup of docsConfig.categories) {
      // 遍历该分类组下的所有链接
      for (const link of categoryGroup.links) {
        // 检查文件路径是否包含该链接的路径
        if (filename.startsWith(`${link.path}/`) || filename === `${link.path}${FILE_EXTENSION}`) {
          categoryName = categoryGroup.name;
          break;
        }
      }
      if (categoryName !== '未分类') {
        break;
      }
    }
    
    const metadata: Document = {
      id: generateId(),
      title: getFileNameWithoutExt(path.basename(filePath)),
      category: categoryName,
      filePath: filename,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      size: stats.size
    };
    
    return {
      content,
      metadata
    };
  }

  /**
   * 创建新文档
   */
  async createDocument(dto: CreateDocumentDto): Promise<Document> {
    const { title, category, content } = dto;
    
    // 确保分类目录存在
    const categoryDir = path.join(this.docsDir, category);
    ensureDir(categoryDir);
    
    // 生成文件名
    const filename = `${title}${FILE_EXTENSION}`;
    const filePath = path.join(categoryDir, filename);
    
    // 写入文件
    fs.writeFileSync(filePath, content, 'utf8');
    
    // 返回文档信息
    const stats = fs.statSync(filePath);
    const relativePath = path.relative(this.docsDir, filePath);
    
    return {
      id: generateId(),
      title,
      category,
      filePath: relativePath,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      size: stats.size
    };
  }

  /**
   * 更新文档
   */
  async updateDocument(filename: string, dto: UpdateDocumentDto): Promise<Document> {
    const { content } = dto;
    const filePath = path.join(this.docsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Document not found');
    }
    
    // 更新文件内容
    fs.writeFileSync(filePath, content, 'utf8');
    
    // 返回更新后的文档信息
    const stats = fs.statSync(filePath);
    const category = path.dirname(filename) || 'uncategorized';
    
    return {
      id: generateId(),
      title: getFileNameWithoutExt(path.basename(filePath)),
      category,
      filePath: filename,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      size: stats.size
    };
  }

  /**
   * 删除文档
   */
  async deleteDocument(filename: string): Promise<{ success: boolean }> {
    const filePath = path.join(this.docsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Document not found');
    }
    
    // 删除文件
    fs.unlinkSync(filePath);
    
    return { success: true };
  }

  /**
   * 批量删除文档
   */
  async batchDeleteDocuments(dto: BatchDeleteDto): Promise<{ success: boolean; deletedCount: number }> {
    const { filenames } = dto;
    let deletedCount = 0;
    
    for (const filename of filenames) {
      try {
        await this.deleteDocument(filename);
        deletedCount++;
      } catch (error) {
        // 忽略删除失败的文件，继续删除其他文件
        console.error(`Failed to delete ${filename}:`, error);
      }
    }
    
    return { success: true, deletedCount };
  }

  /**
   * 搜索文档
   */
  async searchDocuments(keyword: string, category?: string): Promise<{ list: Document[]; total: number }> {
    return this.getDocuments({ keyword, category });
  }

  /**
   * 读取docsConfig.json配置文件
   */
  private readDocsConfig(): any {
    // 从backend目录下读取docsConfig.json文件
    const configPath = path.join(__dirname, '../../docsConfig.json');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    }
    return { categories: [] };
  }

  /**
   * 获取所有分类
   */
  async getCategories(): Promise<Category[]> {
    const categories: Category[] = [];
    const docsConfig = this.readDocsConfig();
    
    // 遍历配置文件中的所有分类组，每个分类组作为一个分类
    let order = 0;
    for (const categoryGroup of docsConfig.categories) {
      // 统计该分类组下所有文档的数量
      let documentCount = categoryGroup.links.length;
      
      // for (const link of categoryGroup.links) {
      //   const categoryDir = path.join(this.docsDir, link.path);
      //   if (fs.existsSync(categoryDir)) {
      //     const allFiles = readDirRecursive(categoryDir);
      //     documentCount += allFiles.filter(file => 
      //       path.extname(file).toLowerCase() === FILE_EXTENSION
      //     ).length;
      //   }
      // }
      
      categories.push({
        id: generateId(),
        name: categoryGroup.name,
        description: categoryGroup.name,
        order: order++,
        documentCount,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // // 添加未分类
    // const rootFiles = fs.readdirSync(this.docsDir, { withFileTypes: true });
    // const uncategorizedCount = rootFiles.filter(file => 
    //   file.isFile() && path.extname(file.name).toLowerCase() === FILE_EXTENSION
    // ).length;
    
    // categories.push({
    //   id: generateId(),
    //   name: '未分类',
    //   description: 'uncategorized',
    //   order: order,
    //   documentCount: uncategorizedCount,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // });
    
    return categories;
  }

  /**
   * 创建分类
   */
  async createCategory(name: string, description: string): Promise<Category> {
    const categoryDir = path.join(this.docsDir, name);
    
    // 确保分类目录不存在
    if (fs.existsSync(categoryDir)) {
      throw new Error('Category already exists');
    }
    
    // 创建分类目录
    ensureDir(categoryDir);
    
    return {
      id: generateId(),
      name,
      description,
      order: (await this.getCategories()).length,
      documentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 更新分类
   */
  async updateCategory(id: string, name: string, description: string): Promise<Category> {
    // 由于我们使用目录名作为分类标识，这里需要额外处理
    // 暂时只更新描述
    
    const categories = await this.getCategories();
    const category = categories.find(cat => cat.id === id);
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return {
      ...category,
      description,
      updatedAt: new Date()
    };
  }

  /**
   * 删除分类
   */
  async deleteCategory(name: string): Promise<{ success: boolean }> {
    const categoryDir = path.join(this.docsDir, name);
    
    if (!fs.existsSync(categoryDir)) {
      throw new Error('Category not found');
    }
    
    // 删除分类目录及其所有内容
    fs.rmSync(categoryDir, { recursive: true, force: true });
    
    return { success: true };
  }

  /**
   * 排序分类
   */
  async sortCategories(ids: string[]): Promise<{ success: boolean }> {
    // 分类排序目前只在内存中实现，实际分类顺序由目录名决定
    return { success: true };
  }
}
