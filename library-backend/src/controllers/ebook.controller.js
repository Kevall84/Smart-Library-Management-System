import { asyncHandler } from '../middlewares/error.middleware.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response.util.js';
import * as ebookService from '../services/ebook.service.js';

/**
 * Free eBooks APIs (Open Library / Gutenberg)
 */

export const search = asyncHandler(async (req, res) => {
  const { q, source = 'openlibrary', page = 1, limit = 20 } = req.query;

  if (!q) {
    return sendErrorResponse(res, 'Query (q) is required', 400);
  }

  const p = parseInt(page);
  const l = parseInt(limit);

  let result;
  if (source === 'openlibrary') {
    result = await ebookService.searchOpenLibrary(q, p, l);
  } else if (source === 'gutenberg') {
    result = await ebookService.searchGutenberg(q, p, l);
  } else {
    return sendErrorResponse(res, 'Invalid source. Use openlibrary or gutenberg', 400);
  }

  return sendSuccessResponse(res, 'eBooks fetched successfully', result);
});

export const details = asyncHandler(async (req, res) => {
  const { externalId } = req.params;
  const { source } = req.query;

  if (!source) {
    return sendErrorResponse(res, 'source is required', 400);
  }

  const ebook = await ebookService.getEbookDetails(externalId, source);
  return sendSuccessResponse(res, 'eBook details fetched successfully', { ebook });
});

