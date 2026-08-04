const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const {
  addGoods,
  getMyGoods,
  getAllGoods,
  updateGoodsStatus,
  deleteGoods,
  getGoodsCount,
} = require("../controllers/goodsController");

router.post("/add", protect, addGoods);
router.get("/my-requests", protect, getMyGoods);
router.get("/", protect, getAllGoods);
router.put("/:id", protect, authorize("admin"), updateGoodsStatus);
router.delete("/:id", protect, deleteGoods);
router.get("/count", protect, getGoodsCount);

module.exports = router;