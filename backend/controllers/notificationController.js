const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

exports.createNotification = asyncHandler(async (req, res) => {
  const { user, title, message, type } = req.body;
  if (!user || !title || !message) {
    return res.status(400).json({ success: false, message: "user, title and message are required" });
  }
  const notification = await Notification.create({ user, title, message, type });
  res.status(201).json({ success: true, notification });
});

// @desc   Get logged in user's notifications
// @route  GET /api/notifications
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, count: notifications.length, unreadCount, notifications });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  notification.isRead = true;
  await notification.save();
  res.json({ success: true, notification });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All notifications marked as read" });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  await notification.deleteOne();
  res.json({ success: true, message: "Notification deleted" });
});
