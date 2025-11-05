const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Single", "Double", "Queen", "King", "Deluxe"],
    required: true,
  },
  price: { type: Number, required: true },
  amenities: [String],
  images: [String], // Cloudinary URLs
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    mainImage: { type: String, required: true }, // Cloudinary URL
    description: String,
    rooms: [roomSchema],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
