const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  const { action, entityType, actor, from, to, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (action) filter.action = action;
  if (entityType) filter.entityType = entityType;
  if (actor) filter.actor = actor;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('actor', 'userName role'),
    AuditLog.countDocuments(filter),
  ]);
  res.status(200).json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

module.exports = { getAuditLogs };
