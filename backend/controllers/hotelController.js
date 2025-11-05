const Hotel = require("../models/Hotel");
const fs = require("fs");
const path = require("path");

// === CONFIGURATION ===
const ENVIRONMENT = process.env.ENVIRONMENT || "test"; // default: test
const IS_LIVE = ENVIRONMENT === "live";

let cloudinary;
if (IS_LIVE) {
  try {
    cloudinary = require("../config/cloudinary");
    console.log("Cloudinary enabled (LIVE mode)");
  } catch (err) {
    console.error("Cloudinary config failed. Falling back to local.");
  }
}

// === UPLOAD FUNCTION (AUTO SWITCH) ===
const uploadImage = async (filePath) => {
  if (IS_LIVE && cloudinary) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "hotels",
      });
      return result.secure_url;
    } catch (err) {}
  }

  // LOCAL MODE (test or fallback)
  const filename = path.basename(filePath);
  return `/ h/uploads/${filename}`; // URL for frontend
};

// === ADD HOTEL ===
const addHotel = async (req, res) => {
  try {
    const { name, address, city, description, rooms } = req.body;
    const files = Object.values(req.files || {}).flat();

    if (!files.length) {
      return res.status(400).json({ msg: "Main image required" });
    }

    const mainImageFile = files.find((f) => f.fieldname === "mainImage");
    if (!mainImageFile) {
      return res.status(400).json({ msg: "Main image required" });
    }

    // Upload main image
    const mainImage = await uploadImage(mainImageFile.path);

    const parsedRooms = JSON.parse(rooms);

    // Upload room images
    for (let i = 0; i < parsedRooms.length; i++) {
      const roomImages = files
        .filter((f) => f.fieldname === "roomImage")
        .filter((img) => img.originalname.includes(`room${i}`));

      const uploadedUrls = await Promise.all(
        roomImages.map((img) => uploadImage(img.path))
      );

      parsedRooms[i].images = uploadedUrls;
    }

    // Create hotel
    const hotel = await Hotel.create({
      name,
      address,
      city,
      description,
      mainImage,
      rooms: parsedRooms,
      owner: req.user,
    });

    // Cleanup local files ONLY in LIVE mode (Cloudinary uploaded)
    if (IS_LIVE && cloudinary) {
      files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Cleanup failed:", file.path);
        });
      });
    }

    console.log(
      `Hotel "${name}" added → ${
        IS_LIVE ? "Cloudinary (LIVE)" : "Local (TEST)"
      }`
    );

    res.status(201).json(hotel);
  } catch (err) {
    console.error("Add Hotel Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// === GET MY HOTELS ===
const getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user });
    res.json(hotels);
  } catch (err) {
    console.error("Get Hotels Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// === UPDATE HOTEL (placeholder) ===
const updateHotel = async (req, res) => {
  res.json({ msg: "Update hotel - implement later" });
};
// === MONTHLY BOOKINGS (mock – replace with real logic later) ===
const getMonthlyBookings = async (req, res) => {
  try {
    // Mock data – replace with real aggregation later
    const mock = [
      { month: "Jan", bookings: 12 },
      { month: "Feb", bookings: 19 },
      { month: "Mar", bookings: 15 },
      { month: "Apr", bookings: 28 },
      { month: "May", bookings: 32 },
      { month: "Jun", bookings: 41 },
    ];
    res.json(mock);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  addHotel,
  getMyHotels,
  getMonthlyBookings,   // ← export it
  updateHotel,
};

// module.exports = { addHotel, getMyHotels, updateHotel };
