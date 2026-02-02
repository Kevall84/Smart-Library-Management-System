import Book from '../models/Book.model.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.util.js';

/**
 * Offline library book business logic
 */

/**
 * Get all books with pagination and filters
 */
export const getAllBooks = async (req) => {
  const { page, limit, skip } = getPaginationParams(req, 12, 100);
  const { search, category, author, isBestseller, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Build query - include books where isActive is true, null, or undefined (treat missing as active)
  // This handles books added directly to MongoDB that might not have isActive field
  const isActiveCondition = {
    $or: [
      { isActive: true },
      { isActive: { $exists: false } },
      { isActive: null },
    ],
  };

  const query = { ...isActiveCondition };

  // Search - combine with isActive check using $and
  if (search) {
    query.$and = [
      isActiveCondition,
      {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      },
    ];
    // Remove the top-level $or since we're using $and now
    delete query.$or;
  }

  // Filters
  if (category) {
    query.category = category;
  }

  if (author) {
    query.author = { $regex: author, $options: 'i' };
  }

  if (isBestseller !== undefined) {
    query.isBestseller = isBestseller === 'true';
  }

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Normalize books: ensure availableQuantity is set if missing (use quantity as fallback)
  const normalizedBooks = books.map((book) => {
    const bookObj = book.toObject ? book.toObject() : book;
    // If availableQuantity is missing/null/undefined but quantity exists, set availableQuantity to quantity
    if ((bookObj.availableQuantity === undefined || bookObj.availableQuantity === null) && 
        bookObj.quantity !== undefined && bookObj.quantity !== null) {
      bookObj.availableQuantity = bookObj.quantity;
    }
    // Ensure isActive defaults to true if missing
    if (bookObj.isActive === undefined || bookObj.isActive === null) {
      bookObj.isActive = true;
    }
    return bookObj;
  });

  const pagination = createPaginationMeta(total, page, limit);

  return {
    books: normalizedBooks,
    pagination,
  };
};

/**
 * Get book by ID
 */
export const getBookById = async (bookId) => {
  const book = await Book.findById(bookId);

  if (!book) {
    throw new Error('Book not found');
  }

  return book;
};

/**
 * Create new book
 */
export const createBook = async (bookData) => {
  const book = await Book.create({
    ...bookData,
    availableQuantity: bookData.quantity || 0,
  });

  return book;
};

/**
 * Update book
 */
export const updateBook = async (bookId, updateData) => {
  // If updating availableQuantity, validate it doesn't exceed quantity
  if (updateData.availableQuantity !== undefined) {
    const existingBook = await Book.findById(bookId);
    if (!existingBook) {
      throw new Error('Book not found');
    }
    
    const maxAvailable = updateData.quantity !== undefined 
      ? updateData.quantity 
      : existingBook.quantity;
    
    if (updateData.availableQuantity > maxAvailable) {
      throw new Error(`Available quantity (${updateData.availableQuantity}) cannot exceed total quantity (${maxAvailable})`);
    }
    
    if (updateData.availableQuantity < 0) {
      throw new Error('Available quantity cannot be negative');
    }
  }

  const book = await Book.findByIdAndUpdate(bookId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!book) {
    throw new Error('Book not found');
  }

  return book;
};

/**
 * Delete book (soft delete)
 */
export const deleteBook = async (bookId) => {
  const book = await Book.findByIdAndUpdate(
    bookId,
    { isActive: false },
    { new: true }
  );

  if (!book) {
    throw new Error('Book not found');
  }

  return book;
};

/**
 * Get available books
 */
export const getAvailableBooks = async (req) => {
  const { page, limit, skip } = getPaginationParams(req, 12, 100);

  // Include books where isActive is true, null, or undefined (treat missing as active)
  // Also handle books with availableQuantity > 0, or if availableQuantity doesn't exist, check quantity > 0
  const query = {
    $and: [
      {
        $or: [
          { isActive: true },
          { isActive: { $exists: false } },
          { isActive: null },
        ],
      },
      {
        $or: [
          { availableQuantity: { $gt: 0 } },
          {
            $and: [
              { availableQuantity: { $exists: false } },
              { quantity: { $gt: 0 } },
            ],
          },
        ],
      },
    ],
  };

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Normalize books: ensure availableQuantity is set if missing (use quantity as fallback)
  const normalizedBooks = books.map((book) => {
    const bookObj = book.toObject ? book.toObject() : book;
    if ((bookObj.availableQuantity === undefined || bookObj.availableQuantity === null) && 
        bookObj.quantity !== undefined && bookObj.quantity !== null) {
      bookObj.availableQuantity = bookObj.quantity;
    }
    if (bookObj.isActive === undefined || bookObj.isActive === null) {
      bookObj.isActive = true;
    }
    return bookObj;
  });

  const pagination = createPaginationMeta(total, page, limit);

  return {
    books: normalizedBooks,
    pagination,
  };
};

/**
 * Get books by category
 */
export const getBooksByCategory = async (category, req) => {
  const { page, limit, skip } = getPaginationParams(req, 12, 100);

  // Include books where isActive is true, null, or undefined (treat missing as active)
  const query = {
    category,
    $or: [
      { isActive: true },
      { isActive: { $exists: false } },
      { isActive: null },
    ],
  };

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Normalize books: ensure availableQuantity is set if missing (use quantity as fallback)
  const normalizedBooks = books.map((book) => {
    const bookObj = book.toObject ? book.toObject() : book;
    if ((bookObj.availableQuantity === undefined || bookObj.availableQuantity === null) && 
        bookObj.quantity !== undefined && bookObj.quantity !== null) {
      bookObj.availableQuantity = bookObj.quantity;
    }
    if (bookObj.isActive === undefined || bookObj.isActive === null) {
      bookObj.isActive = true;
    }
    return bookObj;
  });

  const pagination = createPaginationMeta(total, page, limit);

  return {
    books: normalizedBooks,
    pagination,
  };
};

/**
 * Import books from CSV (will be handled in controller)
 */
export const bulkCreateBooks = async (booksData) => {
  const books = await Book.insertMany(booksData, { ordered: false });
  return books;
};
