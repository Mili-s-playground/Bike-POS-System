const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: String,
    customerPhone: String,
    items: [billItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Bank Transfer"],
      default: "Cash",
    },
    outlet: {
      type: String,
      required: true,
      enum: ["harigala", "arandara"],
    },
    profit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create separate models for each outlet
const HarigalaBill = mongoose.model("HarigalaBill", billSchema);
const ArandaraBill = mongoose.model("ArandaraBill", billSchema);

module.exports = { HarigalaBill, ArandaraBill };
