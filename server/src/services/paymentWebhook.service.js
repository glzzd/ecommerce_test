const mongoose = require("mongoose")
const MockPaymentProvider = require("../providers/mockPaymentProvider")
const AppError = require("../utils/AppError")
const Payment = require("../models/Payment")
const PaymentEvent = require("../models/PaymentEvent")
const Order = require("../models/Order")



const provider = new MockPaymentProvider()

async function processWebhook(rawBody, signature) {
    if(!Buffer.isBuffer(rawBody)) {
        throw new AppError("Webhook raw body teleb olunur")
    }

    // 1. Imzani JSON parse etmezden evvel yoxlayiriq
    const isValid = await provider.verifyWebhook({
        payload: rawBody,
        signature
    })

    if(!isValid) {
        throw new AppError("Webhook imzasi yanlisdir", 400)
    }

    // 2. Imza dogrudursa, JSON parse edirik
    let event
    try {
        event = JSON.parse(rawBody.toString("utf8"))
    } catch (error) {
        throw new AppError("Webhook JSON formati yalnisdir", 400)
    }

    if(typeof event.eventId !== "string" || !event.eventId.trim().length  || typeof event.type !== "string" || !event.data || typeof event.data!== "object") {
        throw new AppError("Webhook melumatlari natamamdir", 400)
    }
    const supportedEvent = ["payment.succeeded", "payment.failed"]

    if(!supportedEvent.includes(event.type)) {
        return {
            ignored: true,
            message: `Webhook event ${event.type} desteklenmir`
        }
    }

    const {providerPaymentId, amount, currency} = event.data

    if(typeof providerPaymentId !== "string" || !Number.isFinite(amount) || typeof currency !== "string") {
        throw new AppError("Payment melumatlari yalnisdir", 400)
    }

    const session = await mongoose.startSession()

    try {
        let result

        await session.withTransaction(async () => {
            // 3. Payment-i provayder ID-si ile tapiriq
            const payment = await Payment.findOne({
                provider: "mock",
                providerPaymentId
            }).session(session)

            if(!payment){
                throw new AppError("Payment tapilmadi", 404)
            }

            // 4. Mebleg ve Valyuta yoxlanilir
            if(Math.round(payment.amount * 100) !== Math.round(amount*100) || payment.currency !== currency.toUpperCase()){
                throw new AppError(
                    "Odenis meblegi ve ya valyutasi uygun gelmir", 409
                )
            }

            // 5. Eyni event evvel emal edilibmi?
            const existingEvent = await PaymentEvent.findOne({
                provider: "mock",
                eventId: event.eventId
            }).session(session)

            if(existingEvent){
                result = {
                    duplicate: true,
                    paymentId: payment._id
                }

                return
            }

            // 6. Odenis eger terminal statusdadirsa, basqa event onun neticesini deyismemelidir
            if(payment.status ===  "succeeded" || payment.status === "failed" || payment.status === "cancelled" || payment.status === "refunded"){
                throw new AppError("Payment artiq yekun statusdadir", 409)
            }

            const order = await Order.findById(payment.order).session(session)

            if(!order){
                throw new AppError("Sifaris tapilmadi", 404)
            }

            if(!order.user.equals(payment.user)){
                throw new AppError("Payment ve Order istifadecileri duygun deyil", 409)
            }


            // 7. Event-i eyni transaction daxilinde qeyd edirik
            await PaymentEvent.create([
                {
                    provider: "mock",
                    eventId: event.eventId,
                    payment: payment._id,
                    eventType: event.type
                }
            ], {session})


            // 8. Odenis neticesini tetbiq edirik
            if(event.type === "payment.succeeded"){
                payment.status = "succeeded"
                payment.paidAt = new Date()
                order.paymentStatus = "paid"
            }

              if(event.type === "payment.failed"){
                payment.status = "failed"
                payment.failureReason = typeof event.data.reason === "string" ? event.data.reason.slice(0,300) : "Payment ugursuz oldu"
                order.paymentStatus = "failed"
            }

            await payment.save({session})
            await order.save({session})

            result = {
                duplicate: false,
                paymentId: payment._id,
                status: payment.status
            }


        })

        return result
    } catch(error) {
    // Paralel gelen eyni event unikal indekse ilise biler
    // Bu halda emal edilmis event kimi qebul edirik

    if(error.code === 11000){
        return {duplicate: true}
    }

    throw error
} finally {
    await session.endSession()
}

}

module.exports = {
    processWebhook
}