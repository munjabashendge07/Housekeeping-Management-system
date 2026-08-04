const GoodsRequest = require("../models/GoodsRequest");

// Create Goods Request
const addGoods = async (req, res) => {
  try {
    const { itemName, quantity, category, urgency } = req.body;

    if (!itemName || !quantity) {
      return res.status(400).json({ message: "Item Name and Quantity are required" });
    }

    const goods = await GoodsRequest.create({
      userId: req.user.id,
      itemName,
      quantity,
      category: category || "Cleaning Supplies",
      urgency: urgency || "Normal",
      status: "Pending",
    });

    const populatedGoods = await GoodsRequest.findById(goods._id).populate(
      "userId",
      "name email role department"
    );

    res.status(201).json(populatedGoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Goods Requests (Housekeeper)
const getMyGoods = async (req, res) => {
  try {
    const goods = await GoodsRequest.find({ userId: req.user.id })
      .populate("userId", "name email role department")
      .sort({ createdAt: -1 });

    res.status(200).json(goods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Goods (Admin gets all, Housekeeper gets own)
const getAllGoods = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.role === "housekeeper") {
      filter.userId = req.user.id;
    }
    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }

    const goods = await GoodsRequest.find(filter)
      .populate("userId", "name email role department phone")
      .sort({ createdAt: -1 });

    res.status(200).json(goods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Goods Request Status (Admin Only)
const updateGoodsStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const goods = await GoodsRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email role department");

    if (!goods) {
      return res.status(404).json({ message: "Goods Request Not Found" });
    }

    res.status(200).json(goods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Goods Request
const deleteGoods = async (req, res) => {
  try {
    const goods = await GoodsRequest.findById(req.params.id);
    if (!goods) {
      return res.status(404).json({ message: "Goods Request Not Found" });
    }

    if (req.user.role !== "admin" && goods.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }

    await GoodsRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Goods Request Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Goods Counts
const getGoodsCount = async (req, res) => {
  try {
    const filter = req.user.role === "housekeeper" ? { userId: req.user.id } : {};

    const count = await GoodsRequest.countDocuments(filter);
    const pending = await GoodsRequest.countDocuments({ ...filter, status: "Pending" });
    const approved = await GoodsRequest.countDocuments({ ...filter, status: "Approved" });
    const rejected = await GoodsRequest.countDocuments({ ...filter, status: "Rejected" });

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
  addGoods,
  getMyGoods,
  getAllGoods,
  updateGoodsStatus,
  deleteGoods,
  getGoodsCount,
};