import { body, validationResult } from 'express-validator';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendSuccessResponse, sendErrorResponse, sendPaginatedResponse } from '../utils/response.util.js';
import * as bookService from '../services/book.service.js';
import csv from 'csv-parser';

/**
 * Offline Books APIs
 */

export const validateCreateBook = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be >= 0'),
  body('rentPerDay').isFloat({ min: 0 }).withMessage('Rent per day must be >= 0'),
];

export const getBooks = asyncHandler(async (req, res) => {
  const result = await bookService.getAllBooks(req);
  return sendPaginatedResponse(res, 'Books retrieved successfully', result.books, result.pagination);
});

export const getAvailableBooks = asyncHandler(async (req, res) => {
  const result = await bookService.getAvailableBooks(req);
  return sendPaginatedResponse(res, 'Available books retrieved successfully', result.books, result.pagination);
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  return sendSuccessResponse(res, 'Book retrieved successfully', { book });
});

export const createBook = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, errors.array());
  }

  const book = await bookService.createBook(req.body);
  return sendSuccessResponse(res, 'Book created successfully', { book }, 201);
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await bookService.updateBook(req.params.id, req.body);
  return sendSuccessResponse(res, 'Book updated successfully', { book });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await bookService.deleteBook(req.params.id);
  return sendSuccessResponse(res, 'Book deleted successfully', { book });
});

/**
 * CSV import
 * Expects multipart/form-data with field name: "file"
 */
export const importBooksFromCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendErrorResponse(res, 'CSV file is required', 400);
  }

  const books = [];
  const errors = [];

  await new Promise((resolve, reject) => {
    const stream = csv();

    stream.on('data', (row) => {
      try {
        // Normalize common column names
        const title = row.title || row.Title || row.bookTitle || row.BookTitle;
        const author = row.author || row.Author;
        const category = row.category || row.Category;
        const quantity = row.quantity || row.Quantity || 0;
        const rentPerDay = row.rentPerDay || row.RentPerDay || row.rent || row.Rent || 0;

        if (!title || !author || !category) {
          errors.push({ row, message: 'Missing required fields (title/author/category)' });
          return;
        }

        books.push({
          title: String(title).trim(),
          author: String(author).trim(),
          category: String(category).trim(),
          isbn: row.isbn || row.ISBN || undefined,
          description: row.description || row.Description || '',
          quantity: Number(quantity) || 0,
          rentPerDay: Number(rentPerDay) || 0,
          coverImage: row.coverImage || row.CoverImage || null,
          isBestseller:
            String(row.isBestseller || row.Bestseller || 'false').toLowerCase() === 'true',
          publishedYear: row.publishedYear || row.PublishedYear || undefined,
          publisher: row.publisher || row.Publisher || undefined,
          language: row.language || row.Language || undefined,
        });
      } catch (e) {
        errors.push({ row, message: e.message || 'Invalid row' });
      }
    });

    stream.on('end', resolve);
    stream.on('error', reject);

    stream.write(req.file.buffer);
    stream.end();
  });

  if (!books.length) {
    return sendErrorResponse(res, 'No valid rows found in CSV', 400, errors);
  }

  const inserted = await bookService.bulkCreateBooks(books);
  return sendSuccessResponse(
    res,
    'Books imported successfully',
    { insertedCount: inserted.length, errors },
    201
  );
});

