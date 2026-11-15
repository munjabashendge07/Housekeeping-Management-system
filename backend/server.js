
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const goodsRoutes = require("./routes/goodsRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();

app.use(express.json());
app.use(cors());

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

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
