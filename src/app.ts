import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db";
import appRoute from "./routes";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

connectDB();
app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

// Routes
app.use("/api", appRoute);

app.get("/", (req, res) => {
  console.log("hello");
  res.send("Backend is hosted on this server for sometime !");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
