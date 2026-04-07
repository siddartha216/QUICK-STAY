import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ✅ Load env variables
dotenv.config();

import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// ✅ Connect DB + Cloudinary
connectDB();
connectCloudinary();

const app = express();


// ✅ IMPORTANT for Render (proxy support)
app.set("trust proxy", 1);


// ✅ CORS (allow frontend)
app.use(cors({
  origin: "*", // later replace with your frontend URL
  credentials: true
}));



// ✅ Clerk middleware FIRST
app.use(clerkMiddleware());


// ✅ Webhook (RAW body required)
app.use(
  "/api/clerk",
  express.raw({
    type: "application/json",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
  clerkWebhooks
);


// ✅ JSON parser AFTER webhook
app.use(express.json());


// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});


// ✅ Routes
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);


// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Server error",
  });
});


// ✅ Port config
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});