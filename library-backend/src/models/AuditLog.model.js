import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.constants.js';

/**
 * Logs admin & librarian actions
 */

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    userRole: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      index: true,
    },
    resource: {
      type: String, // 'user', 'book', 'rental', 'payment', etc.
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    endpoint: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    changes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Store before/after values
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'error'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying logs
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
