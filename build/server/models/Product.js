const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Bicycle", "Accessories", "Parts", "Clothing", "Tools"],
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 10,
    },
    description: String,
    outlet: {
      type: String,
      required: true,
      enum: ["harigala", "arandara"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create separate models for each outlet
const HarigalaProduct = mongoose.model("HarigalaProduct", productSchema);
const ArandaraProduct = mongoose.model("ArandaraProduct", productSchema);

module.exports = { HarigalaProduct, ArandaraProduct };
