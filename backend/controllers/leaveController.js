const Leave = require("../models/Leave");

// Apply Leave (Housekeeper / Logged In User)
const applyLeave = async (req, res) => {
  try {
    const { reason, fromDate, toDate, leaveType } = req.body;

    if (!reason || !fromDate || !toDate) {
      return res.status(400).json({ message: "Reason, From Date, and To Date are required" });
    }

    const leave = await Leave.create({
      userId: req.user.id,
      leaveType: leaveType || "Casual",
      reason,
      fromDate,
      toDate,
      status: "Pending",
    });

    const populatedLeave = await Leave.findById(leave._id).populate("userId", "name email role department");

    res.status(201).json({
      message: "Leave Applied Successfully",
      leave: populatedLeave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Leaves (Housekeeper)
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.id })
      .populate("userId", "name email role department")
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Leaves (Admin gets all, Housekeeper gets own)
const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (req.user && req.user.role === "housekeeper") {
      filter.userId = req.user.id;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    const leaves = await Leave.find(filter)
      .populate("userId", "name email role department phone")
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Leave Status (Admin Only)
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email role department");

    if (!leave) {
      return res.status(404).json({ message: "Leave Record Not Found" });
    }

    res.status(200).json({
      message: `Leave Status Updated to ${leave.status}`,
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Leave
const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave Record Not Found" });
    }

    // Check permission: either Admin or the leave owner can delete if pending
    if (req.user.role !== "admin" && leave.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this leave" });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Leave Request Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Leave Counts
const getLeaveCount = async (req, res) => {
  try {
    const filter = req.user.role === "housekeeper" ? { userId: req.user.id } : {};
    
    const count = await Leave.countDocuments(filter);
    const pending = await Leave.countDocuments({ ...filter, status: "Pending" });
    const approved = await Leave.countDocuments({ ...filter, status: "Approved" });
    const rejected = await Leave.countDocuments({ ...filter, status: "Rejected" });

    res.status(200).json({
      count,
      pending,
      approved,
      rejected,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  deleteLeave,
  getLeaveCount,
};