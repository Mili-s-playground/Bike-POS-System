const express = require("express");
const router = express.Router();
const { HarigalaBill, ArandaraBill } = require("../models/Bill");
const { HarigalaProduct, ArandaraProduct } = require("../models/Product");

// Get models based on outlet
const getModels = (outlet) => {
  if (outlet === "harigala") {
    return { BillModel: HarigalaBill, ProductModel: HarigalaProduct };
  } else {
    return { BillModel: ArandaraBill, ProductModel: ArandaraProduct };
  }
};

// GET sales report
router.get("/:outlet/sales", async (req, res) => {
  try {
    const { outlet } = req.params;
    const { startDate, endDate } = req.query;

    const { BillModel } = getModels(outlet);

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const bills = await BillModel.find(dateFilter);

    const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);
    const totalProfit = bills.reduce((sum, bill) => sum + bill.profit, 0);
    const totalBills = bills.length;

    // Group by day
    const dailySales = bills.reduce((acc, bill) => {
      const date = bill.createdAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { sales: 0, profit: 0, bills: 0 };
      }
      acc[date].sales += bill.total;
      acc[date].profit += bill.profit;
      acc[date].bills += 1;
      return acc;
    }, {});

    // Top selling products
    const productSales = {};
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.totalPrice;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      summary: {
        totalSales,
        totalProfit,
        totalBills,
        averageOrderValue: totalBills > 0 ? totalSales / totalBills : 0,
      },
      dailySales,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET inventory report
router.get("/:outlet/inventory", async (req, res) => {
  try {
    const { outlet } = req.params;
    const { ProductModel } = getModels(outlet);

    const products = await ProductModel.find({ isActive: true });

    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, product) => sum + product.quantity * product.purchasePrice,
      0
    );

    const lowStockProducts = products.filter(
      (product) => product.quantity <= product.minStockLevel
    );

    const outOfStockProducts = products.filter(
      (product) => product.quantity === 0
    );

    // Category-wise breakdown
    const categoryBreakdown = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          count: 0,
          value: 0,
          quantity: 0,
        };
      }
      acc[product.category].count += 1;
      acc[product.category].value += product.quantity * product.purchasePrice;
      acc[product.category].quantity += product.quantity;
      return acc;
    }, {});

    res.json({
      summary: {
        totalProducts,
        totalValue,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },
      lowStockProducts,
      outOfStockProducts,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
