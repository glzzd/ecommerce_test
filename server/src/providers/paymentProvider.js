class PaymentProvider {
    async createPayment() {
        throw new Error('createPayment() implement edilmeyib');
    }

     async verifyWebhook() {
        throw new Error('verifyWebhook() implement edilmeyib');
    }

     async refund() {
        throw new Error('refund() implement edilmeyib');
    }
}

module.exports = PaymentProvider;