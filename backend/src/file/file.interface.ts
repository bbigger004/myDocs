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

export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  documentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentQuery {
  category?: string;
  keyword?: string;
}

export interface CreateDocumentDto {
  title: string;
  category: string;
  content: string;
}

export interface UpdateDocumentDto {
  content: string;
}

export interface BatchDeleteDto {
  filenames: string[];
}
