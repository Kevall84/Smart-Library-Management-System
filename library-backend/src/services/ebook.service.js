import Ebook from '../models/Ebook.model.js';
import { openLibraryClient, gutenbergClient } from '../config/ebook.config.js';

/**
 * Fetch free eBooks from Open Library / Gutenberg
 */

/**
 * Search eBooks from Open Library
 */
export const searchOpenLibrary = async (query, page = 1, limit = 20) => {
  try {
    const response = await openLibraryClient.get('/search.json', {
      params: {
        q: query,
        page,
        limit,
      },
    });

    const books = response.data.docs || [];
    const totalResults = response.data.numFound || 0;

    // Transform to standard format
    const formattedBooks = books.map((book) => ({
      externalId: `openlibrary_${book.key}`,
      source: 'openlibrary',
      title: book.title || 'Untitled',
      authors: book.author_name || [],
      description: book.first_sentence?.[0] || '',
      coverImage: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : null,
      publishedYear: book.first_publish_year || null,
      subject: book.subject || [],
    }));

    return {
      books: formattedBooks,
      total: totalResults,
      page,
      limit,
    };
  } catch (error) {
    console.error('Open Library API error:', error);
    throw new Error('Failed to fetch eBooks from Open Library');
  }
};

/**
 * Search eBooks from Gutenberg (via Gutendex API)
 */
export const searchGutenberg = async (query, page = 1, limit = 20) => {
  try {
    const response = await gutenbergClient.get('/books', {
      params: {
        search: query,
        page,
        languages: 'en', // Gutendex expects comma-separated string, not array
      },
    });

    const books = response.data?.results || [];
    const count = response.data?.count || 0;

    // Transform to standard format
    const formattedBooks = books.map((book) => {
      const formats = book.formats || {};
      // Prioritize PDF, then HTML (for in-browser reading), then EPUB, then plain text
      const downloadUrl = formats['application/pdf'] 
        || formats['text/html; charset=utf-8'] 
        || formats['text/html']
        || formats['application/epub+zip'] 
        || formats['text/plain; charset=utf-8']
        || formats['text/plain']
        || null;
      
      // Get cover image if available
      const coverImage = book.formats?.['image/jpeg'] 
        ? book.formats['image/jpeg']
        : null;
      
      return {
        externalId: `gutenberg_${book.id}`,
        source: 'gutenberg',
        title: book.title || 'Untitled',
        authors: (book.authors || []).map((a) => a.name || a).filter(Boolean),
        description: '',
        coverImage,
        downloadUrl,
        formats: Object.keys(formats),
        publishedYear: null,
        subject: book.subjects || [],
      };
    });

    return {
      books: formattedBooks,
      total: count,
      page,
      limit,
    };
  } catch (error) {
    console.error('Gutenberg API error:', error);
    const errorMessage = error.response?.data?.detail 
      || error.message 
      || 'Failed to fetch eBooks from Gutenberg';
    throw new Error(errorMessage);
  }
};

/**
 * Get eBook details by external ID
 */
export const getEbookDetails = async (externalId, source) => {
  try {
    if (source === 'openlibrary') {
      const workId = externalId.replace('openlibrary_', '');
      const response = await openLibraryClient.get(`${workId}.json`);

      const book = response.data;
      // Open Library doesn't provide direct download URLs via API
      // Users need to access through the web interface
      // workId is already in format like "/works/OL123456W"
      const openLibraryUrl = `https://openlibrary.org${workId}`;
      
      return {
        externalId,
        source,
        title: book.title || 'Untitled',
        authors: book.authors?.map((a) => a.author?.key || a) || [],
        description: book.description?.value || book.description || '',
        coverImage: book.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
          : null,
        publishedYear: book.first_publish_date?.substring(0, 4) || null,
        subject: book.subjects || [],
        openLibraryUrl,
      };
    } else if (source === 'gutenberg') {
      const bookId = externalId.replace('gutenberg_', '');
      const response = await gutenbergClient.get(`/books/${bookId}`);

      const book = response.data;
      const formats = book.formats || {};
      // Prioritize PDF, then HTML (for in-browser reading), then EPUB, then plain text
      const downloadUrl = formats['application/pdf'] 
        || formats['text/html; charset=utf-8'] 
        || formats['text/html']
        || formats['application/epub+zip'] 
        || formats['text/plain; charset=utf-8']
        || formats['text/plain']
        || null;
      
      // Get cover image if available
      const coverImage = formats['image/jpeg'] || null;
      
      return {
        externalId,
        source,
        title: book.title || 'Untitled',
        authors: (book.authors || []).map((a) => a.name || a).filter(Boolean),
        description: '',
        coverImage,
        downloadUrl,
        formats: Object.keys(formats),
        publishedYear: null,
        subject: book.subjects || [],
      };
    }

    throw new Error('Invalid source');
  } catch (error) {
    console.error('Get eBook details error:', error);
    const errorMessage = error.response?.data?.detail 
      || error.message 
      || 'Failed to fetch eBook details';
    throw new Error(errorMessage);
  }
};

/**
 * Cache eBook in database (optional)
 */
export const cacheEbook = async (ebookData) => {
  try {
    const ebook = await Ebook.findOneAndUpdate(
      { externalId: ebookData.externalId },
      { ...ebookData, lastFetched: new Date() },
      { upsert: true, new: true }
    );

    return ebook;
  } catch (error) {
    console.error('Cache eBook error:', error);
    throw new Error('Failed to cache eBook');
  }
};

/**
 * Get cached eBook
 */
export const getCachedEbook = async (externalId) => {
  return await Ebook.findOne({ externalId });
};
