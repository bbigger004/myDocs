import * as fs from 'fs';
import * as path from 'path';

/**
 * 确保目录存在
 */
export const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * 获取文件扩展名
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

/**
 * 获取文件名（不含扩展名）
 */
export const getFileNameWithoutExt = (filename: string): string => {
  return path.basename(filename, getFileExtension(filename));
};

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 格式化日期
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toISOString();
};

/**
 * 递归读取目录下所有文件
 */
export const readDirRecursive = (dirPath: string, fileList: string[] = []): string[] => {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      readDirRecursive(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }

  return fileList;
};
