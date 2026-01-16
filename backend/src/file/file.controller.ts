import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FileService } from './file.service';
import type { DocumentQuery, CreateDocumentDto, UpdateDocumentDto, BatchDeleteDto } from './file.interface';
import { Document, Category } from './file.interface';

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({ summary: '获取文档列表', description: '获取所有文档的列表，支持分类和搜索' })
  @ApiQuery({ name: 'category', required: false, description: '文档分类' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiResponse({ status: 200, description: '成功获取文档列表' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Get()
  async getDocuments(@Query() query: DocumentQuery) {
    try {
      const result = await this.fileService.getDocuments(query);
      return {
        code: 200,
        message: 'Success',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 分类管理接口 - 放在动态路由之前，避免路由冲突
  @ApiOperation({ summary: '获取分类列表', description: '获取所有文档分类' })
  @ApiResponse({ status: 200, description: '成功获取分类列表' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Get('categories')
  async getCategories() {
    try {
      const result = await this.fileService.getCategories();
      return {
        code: 200,
        message: 'Success',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '创建分类', description: '创建新的文档分类' })
  @ApiBody({ description: '创建分类的请求体' })
  @ApiResponse({ status: 201, description: '成功创建分类' })
  @ApiResponse({ status: 409, description: '分类已存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Post('categories')
  async createCategory(@Body() body: { name: string; description: string }) {
    try {
      const { name, description } = body;
      const result = await this.fileService.createCategory(name, description);
      return {
        code: 201,
        message: 'Category created successfully',
        data: result
      };
    } catch (error) {
      if (error.message === 'Category already exists') {
        throw new HttpException(
          { code: HttpStatus.CONFLICT, message: error.message, data: null },
          HttpStatus.CONFLICT
        );
      }
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '更新分类', description: '更新现有分类的信息' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiBody({ description: '更新分类的请求体' })
  @ApiResponse({ status: 200, description: '成功更新分类' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: { name: string; description: string }) {
    try {
      const { name, description } = body;
      const result = await this.fileService.updateCategory(id, name, description);
      return {
        code: 200,
        message: 'Category updated successfully',
        data: result
      };
    } catch (error) {
      if (error.message === 'Category not found') {
        throw new HttpException(
          { code: HttpStatus.NOT_FOUND, message: error.message, data: null },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '删除分类', description: '删除指定的文档分类' })
  @ApiParam({ name: 'name', description: '分类名称' })
  @ApiResponse({ status: 200, description: '成功删除分类' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Delete('categories/:name')
  async deleteCategory(@Param('name') name: string) {
    try {
      const result = await this.fileService.deleteCategory(name);
      return {
        code: 200,
        message: 'Category deleted successfully',
        data: result
      };
    } catch (error) {
      if (error.message === 'Category not found') {
        throw new HttpException(
          { code: HttpStatus.NOT_FOUND, message: error.message, data: null },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '排序分类', description: '对文档分类进行排序' })
  @ApiBody({ description: '排序分类的请求体' })
  @ApiResponse({ status: 200, description: '成功排序分类' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Post('categories/sort')
  async sortCategories(@Body() body: { ids: string[] }) {
    try {
      const { ids } = body;
      const result = await this.fileService.sortCategories(ids);
      return {
        code: 200,
        message: 'Categories sorted successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '批量删除文档', description: '批量删除多个文档' })
  @ApiBody({ description: '批量删除文档的请求体' })
  @ApiResponse({ status: 200, description: '成功批量删除文档' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Post('batch-delete')
  async batchDeleteDocuments(@Body() dto: BatchDeleteDto) {
    try {
      const result = await this.fileService.batchDeleteDocuments(dto);
      return {
        code: 200,
        message: 'Documents deleted successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '搜索文档', description: '根据关键词搜索文档' })
  @ApiQuery({ name: 'keyword', description: '搜索关键词' })
  @ApiQuery({ name: 'category', required: false, description: '文档分类' })
  @ApiResponse({ status: 200, description: '成功搜索文档' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Get('search')
  async searchDocuments(@Query('keyword') keyword: string, @Query('category') category?: string) {
    try {
      const result = await this.fileService.searchDocuments(keyword, category);
      return {
        code: 200,
        message: 'Search completed successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '获取文档内容', description: '获取指定文档的内容和元数据' })
  @ApiParam({ name: 'filename', description: '文档文件名' })
  @ApiResponse({ status: 200, description: '成功获取文档内容' })
  @ApiResponse({ status: 404, description: '文档不存在' })
  @Get(':filename')
  async getDocumentContent(@Param('filename') filename: string) {
    try {
      const result = await this.fileService.getDocumentContent(filename);
      return {
        code: 200,
        message: 'Success',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { code: HttpStatus.NOT_FOUND, message: error.message, data: null },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @ApiOperation({ summary: '创建文档', description: '创建新的文档' })
  @ApiBody({ description: '创建文档的请求体' })
  @ApiResponse({ status: 201, description: '成功创建文档' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Post()
  async createDocument(@Body() dto: CreateDocumentDto) {
    try {
      const result = await this.fileService.createDocument(dto);
      return {
        code: 201,
        message: 'Document created successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '更新文档', description: '更新现有文档的内容' })
  @ApiParam({ name: 'filename', description: '文档文件名' })
  @ApiBody({ description: '更新文档的请求体' })
  @ApiResponse({ status: 200, description: '成功更新文档' })
  @ApiResponse({ status: 404, description: '文档不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Put(':filename')
  async updateDocument(@Param('filename') filename: string, @Body() dto: UpdateDocumentDto) {
    try {
      const result = await this.fileService.updateDocument(filename, dto);
      return {
        code: 200,
        message: 'Document updated successfully',
        data: result
      };
    } catch (error) {
      if (error.message === 'Document not found') {
        throw new HttpException(
          { code: HttpStatus.NOT_FOUND, message: error.message, data: null },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @ApiOperation({ summary: '删除文档', description: '删除指定的文档' })
  @ApiParam({ name: 'filename', description: '文档文件名' })
  @ApiResponse({ status: 200, description: '成功删除文档' })
  @ApiResponse({ status: 404, description: '文档不存在' })
  @ApiResponse({ status: 500, description: '服务器内部错误' })
  @Delete(':filename')
  async deleteDocument(@Param('filename') filename: string) {
    try {
      const result = await this.fileService.deleteDocument(filename);
      return {
        code: 200,
        message: 'Document deleted successfully',
        data: result
      };
    } catch (error) {
      if (error.message === 'Document not found') {
        throw new HttpException(
          { code: HttpStatus.NOT_FOUND, message: error.message, data: null },
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        { code: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message, data: null },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
