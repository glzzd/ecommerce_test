const mongoose = require("mongoose");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const AppError = require("../utils/AppError");

class InventoryService {
  async addStock({ productId, quantity, reason, performedBy }) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError("Say musbet tam eded olmalidir", 400);
    }

    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        const product = await Product.findById(productId).session(session);

        if (!product) {
          throw new AppError("Mehsul tapilmadi", 404);
        }

        const previousStock = product.stock;
        const previousReservedStock = product.reservedStock;

        product.stock += quantity;

        await product.save({ session });

        await StockMovement.create(
          [
            {
              product: product._id,
              type: "stock_in",
              quantity,
              previousStock,
              newStock: product.stock,
              previousReservedStock,
              newReservedStock: product.reservedStock,
              reason,
              performedBy,
            },
          ],
          { session },
        );

        result = product;
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async adjustStock({ productId, newStock, reason, performedBy }) {
    if (!Number.isInteger(newStock) || newStock < 0) {
      throw new AppError(
        "Yeni stok sayi 0 ve ya musbet tam eded olmalidir",
        400,
      );
    }
    const session = await mongoose.startSession();

    try {
      let result;
      await session.withTransaction(async () => {
        const product = await Product.findById(productId).session(session);

        if (!product) {
          throw new AppError("Mehsul tapilmadi", 404);
        }

        if (newStock < product.reservedStock) {
          throw new AppError(
            "Yeni stock rezerv edilmis stok sayindan az ola bilməz",
            409,
          );
        }
        const previousStock = product.stock;
        const previousReservedStock = product.reservedStock;

        const difference = Math.abs(newStock - previousStock);

        product.stock = newStock;

        await product.save({ session });

        if (difference > 0) {
          await StockMovement.create(
            [
              {
                product: product._id,
                type: "adjusment",
                quantity: difference,
                previousStock,
                newStock,
                previousReservedStock,
                newReservedStock: product.reservedStock,
                reason,
                performedBy,
              },
            ],
            { session },
          );
        }

        result = product;
      });

      return product;
    } finally {
        await session.endSession()
    }
  }
}

module.exports = new InventoryService()