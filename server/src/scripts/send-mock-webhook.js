
const crypto = require("crypto");

const paymentId = process.argv[2];
const amount = Number(process.argv[3]);
const eventType = process.argv[4] || "payment.succeeded";

if (!paymentId || !Number.isFinite(amount)) {
    console.log(
        "Istifade: node scripts/send-mock-webhook.js PAYMENT_ID AMOUNT [EVENT_TYPE]"
    );
    process.exit(1);
}

if (!process.env.MOCK_WEBHOOK_SECRET) {
    console.error("MOCK_WEBHOOK_SECRET teyin edilmeyib");
    process.exit(1);
}

const event = {
    eventId: `evt-${crypto.randomUUID()}`,
    type: eventType,
    data: {
        providerPaymentId: paymentId,
        amount,
        currency: "AZN"
    }
};

const rawBody = JSON.stringify(event);

const signature = crypto
    .createHmac("sha256", process.env.MOCK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

async function sendWebhook() {
    const response = await fetch(
        "http://127.0.0.1:3000/api/webhooks/mock",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-mock-signature": signature
            },
            body: rawBody
        }
    );

    const result = await response.json();

    console.log("HTTP STATUS:", response.status);
    console.log(JSON.stringify(result, null, 2));

    if (!response.ok) {
        throw new Error(`Webhook HTTP error: ${response.status}`);
    }
}

sendWebhook().catch((error) => {
    console.error("Webhook test xetasi:", error.message);
    process.exitCode = 1;
});
