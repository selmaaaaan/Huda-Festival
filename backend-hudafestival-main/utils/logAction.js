const AuditLog = require('../models/AuditLog');

/**
 * Log an action to the audit log.
 * @param {Object} opts
 * @param {string|ObjectId} opts.actor - User ID performing the action
 * @param {string} opts.actorRole - Role of the user
 * @param {string} opts.action - Action string e.g. 'CANDIDATE_CREATED'
 * @param {string} opts.entityType - 'Candidate'|'Programme'|'Registration'|'Result'|'User'
 * @param {string|ObjectId} [opts.entityId] - ID of the entity
 * @param {Object} [opts.details] - before/after snapshot or other details
 * @param {Object} [opts.req] - Express request object for IP address
 */
async function logAction({ actor, actorRole, action, entityType, entityId, details = {}, req }) {
  try {
    const entry = new AuditLog({
      actor,
      actorRole,
      action,
      entityType,
      entityId: entityId || undefined,
      details,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress) : undefined,
    });
    await entry.save();
  } catch (err) {
    // Never let logging failures crash the main request
    console.error('[AuditLog] Failed to write log entry:', err.message);
  }
}

module.exports = { logAction };
