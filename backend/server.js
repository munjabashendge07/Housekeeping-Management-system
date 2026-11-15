const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const goodsRoutes = require("./routes/goodsRoutes");
const activityRoutes = require("./routes/activityRoutes");

// Load .env from backend folder or root
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Root & Health check routes
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Housekeeping Management System API is running successfully",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/goods", goodsRoutes);
app.use("/api/activity", activityRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





