const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const goodsRoutes = require("./routes/goodsRoutes");
const activityRoutes = require("./routes/activityRoutes");




dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());


app.use("/api/users", userRoutes);

app.use("/api/leaves", leaveRoutes);

app.use("/api/goods", goodsRoutes);

app.use("/api/activity", activityRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});




