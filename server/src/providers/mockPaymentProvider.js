
const PaymentProvider = require("./paymentProvider");
const crypto = require("node:crypto");

class MockPaymentProvider extends PaymentProvider {
  async createPayment({ paymentId, amount, currency }) {
    return {
      providerPaymentId: `MOCK-${paymentId}`,
      status: "processing",
      amount,
      currency,
    };
  }

  async verifyWebhook({ payload, signature }) {
    const secret = process.env.MOCK_WEBHOOK_SECRET;

    if (!secret) {
      throw new Error("MOCK_WEBHOOK_SECRET təyin edilməyib");
    }

    if (
      typeof signature !== "string" ||
      !/^[a-fA-F0-9]{64}$/.test(signature)
    ) {
      return false;
    }

    if (!Buffer.isBuffer(payload) && typeof payload !== "string") {
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest();

    const receivedSignature = Buffer.from(signature, "hex");

    return crypto.timingSafeEqual(
      expectedSignature,
      receivedSignature
    );
  }

  async refund() {
    return {
      status: "refunded",
      providerRefundId: `MOCK-REFUND-${Date.now()}`,
    };
  }
}

module.exports = MockPaymentProvider;
