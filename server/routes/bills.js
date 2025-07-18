const express = require("express");
const router = express.Router();
const { HarigalaBill, ArandaraBill } = require("../models/Bill");
const { HarigalaProduct, ArandaraProduct } = require("../models/Product");
const Joi = require("joi");

// Validation schema
const billSchema = Joi.object({
  customerName: Joi.string().allow(""),
  customerPhone: Joi.string().allow(""),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
      })
    )
    .required(),
  discount: Joi.number().min(0).default(0),
  paymentMethod: Joi.string()
    .valid("Cash", "Card", "Bank Transfer")
    .default("Cash"),
  outlet: Joi.string().valid("harigala", "arandara").required(),
});

// Get models based on outlet
const getModels = (outlet) => {
  if (outlet === "harigala") {
    return { BillModel: HarigalaBill, ProductModel: HarigalaProduct };
  } else {
    return { BillModel: ArandaraBill, ProductModel: ArandaraProduct };
  }
};

// Generate bill number
const generateBillNumber = async (outlet) => {
  const { BillModel } = getModels(outlet);
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = outlet.toUpperCase().substring(0, 3);

  const lastBill = await BillModel.findOne({
    billNumber: { $regex: `^${prefix}${dateStr}` },
  }).sort({ billNumber: -1 });

  let sequence = 1;
  if (lastBill) {
    const lastSequence = parseInt(lastBill.billNumber.slice(-3));
    sequence = lastSequence + 1;
  }

  return `${prefix}${dateStr}${sequence.toString().padStart(3, "0")}`;
};

// GET all bills for an outlet
router.get("/:outlet", async (req, res) => {
  try {
    const { outlet } = req.params;
    const { BillModel } = getModels(outlet);

    const bills = await BillModel.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single bill
router.get("/:outlet/:id", async (req, res) => {
  try {
    const { outlet, id } = req.params;
    const { BillModel } = getModels(outlet);

    const bill = await BillModel.findById(id);
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new bill
router.post("/", async (req, res) => {
  try {
    const { error, value } = billSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { BillModel, ProductModel } = getModels(value.outlet);

    // Generate bill number
    const billNumber = await generateBillNumber(value.outlet);

    // Calculate bill details
    let subtotal = 0;
    let totalProfit = 0;
    const billItems = [];

    for (const item of value.items) {
      const product = await ProductModel.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.sellingPrice * item.quantity;
      const itemProfit =
        (product.sellingPrice - product.purchasePrice) * item.quantity;

      billItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        totalPrice: itemTotal,
        purchasePrice: product.purchasePrice,
      });

      subtotal += itemTotal;
      totalProfit += itemProfit;

      // Update product quantity
      await ProductModel.findByIdAndUpdate(product._id, {
        $inc: { quantity: -item.quantity },
      });
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - value.discount;

    const bill = new BillModel({
      billNumber,
      customerName: value.customerName,
      customerPhone: value.customerPhone,
      items: billItems,
      subtotal,
      tax,
      discount: value.discount,
      total,
      paymentMethod: value.paymentMethod,
      outlet: value.outlet,
      profit: totalProfit - value.discount,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
