import mongoose from 'mongoose';

/**
 * Cached metadata for free eBooks (optional)
 */

const ebookSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['openlibrary', 'gutenberg'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    authors: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String, // URL to cover image
    },
    downloadUrl: {
      type: String, // URL to download the eBook
    },
    formats: [
      {
        type: String, // epub, pdf, txt, etc.
      },
    ],
    language: {
      type: String,
      default: 'English',
    },
    publishedYear: {
      type: Number,
    },
    subject: [
      {
        type: String,
      },
    ],
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastFetched: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
ebookSchema.index({ title: 'text', authors: 'text', description: 'text' });

const Ebook = mongoose.model('Ebook', ebookSchema);

export default Ebook;
