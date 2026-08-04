const Activity = require("../models/Activity");

// Create / Add Task Activity
const addActivity = async (req, res) => {
  try {
    const { taskName, description, roomNumber, priority, status, dueDate, userId } = req.body;

    if (!taskName) {
      return res.status(400).json({ message: "Task name is required" });
    }

    const activity = await Activity.create({
      userId: userId || req.user.id,
      taskName,
      description: description || "",
      roomNumber: roomNumber || "",
      priority: priority || "Medium",
      status: status || "Pending",
      dueDate: dueDate || null,
    });

    const populatedActivity = await Activity.findById(activity._id).populate(
      "userId",
      "name email role department"
    );

    res.status(201).json(populatedActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Activities (Admin gets all, Housekeeper gets assigned)
const getAllActivities = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.role === "housekeeper") {
      filter.userId = req.user.id;
    }
    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }

    const activities = await Activity.find(filter)
      .populate("userId", "name email role department phone")
      .sort({ createdAt: -1 });

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Activity Status / Details
const updateActivity = async (req, res) => {
  try {
    const { status, taskName, description, roomNumber, priority, dueDate, userId } = req.body;
    const updateData = {};

    if (status) updateData.status = status;
    if (taskName) updateData.taskName = taskName;
    if (description !== undefined) updateData.description = description;
    if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
    if (priority) updateData.priority = priority;
    if (dueDate) updateData.dueDate = dueDate;
    if (userId) updateData.userId = userId;

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email role department");

    if (!activity) {
      return res.status(404).json({ message: "Activity Not Found" });
    }

    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Activity
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activity Not Found" });
    }

    if (req.user.role !== "admin" && activity.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await Activity.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Activity Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Activity Count & Metrics
const getActivityCount = async (req, res) => {
  try {
    const filter = req.user.role === "housekeeper" ? { userId: req.user.id } : {};

    const count = await Activity.countDocuments(filter);
    const pending = await Activity.countDocuments({ ...filter, status: "Pending" });
    const inProgress = await Activity.countDocuments({ ...filter, status: "In Progress" });
    const completed = await Activity.countDocuments({ ...filter, status: "Completed" });

    res.status(200).json({
      count,
      pending,
      inProgress,
      completed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addActivity,
  getAllActivities,
  updateActivity,
  deleteActivity,
  getActivityCount,
};