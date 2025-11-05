// const express = require("express");
// const router = express.Router();
// const {
//   addHotel,
//   getMyHotels,
//   updateHotel,
// } = require("../controllers/hotelController");
// const { protect } = require("../middleware/auth");
// const multer = require("multer");

// // === MULTER CONFIG ===
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// // === ROUTES ===
// router.post(
//   "/",
//   protect,
//   upload.fields([
//     { name: "mainImage", maxCount: 1 },
//     { name: "roomImage", maxCount: 10 },
//   ]),
//   addHotel
// );

// router.get("/my", protect, getMyHotels); // ← This line was broken

// // Optional: Add update/delete later
// // router.put("/:id", protect, upload.fields([...]), updateHotel);
// // router.delete("/:id", protect, deleteHotel);

// module.exports = router;

const express = require("express");
const router = express.Router();
const { addHotel, getMyHotels } = require("../controllers/hotelController");
const { protect } = require("../middleware/auth");
const { getMonthlyBookings } = require("../controllers/hotelController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post(
  "/",
  protect,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "roomImage", maxCount: 10 },
  ]),
  addHotel
);

router.get("/my", protect, getMyHotels);
router.get("/bookings/monthly", protect, getMonthlyBookings);

module.exports = router;
