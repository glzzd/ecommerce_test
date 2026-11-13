const inventoryService = require("../services/inventory.service");
const asyncHandler = require("../utils/asyncHandler");

exports.addStock = asyncHandler(async (req, res) => {
  const product = await inventoryService.addStock({
    productId: req.params.productId,
    quantity: req.body.quantity,
    reason: req.body.reason,
    performedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Stok ugurla artirildi",
    data: product,
  });
});

exports.adjustStock = asyncHandler(async (req, res) => {
  const product = await inventoryService.addStock({
    productId: req.params.productId,
    quantity: req.body.quantity,
    reason: req.body.reason,
    performedBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Stok ugurla yenilendi",
    data: product,
  });
});
