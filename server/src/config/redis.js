const {createClient} = require("redis")


const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
        reconnectStrategy: (retries)=>{
            if(retries>5){
                return new Error("Redis bağlantısı bərpa edilə bilmədi")
            }

            return Math.min(retries*500, 3000)
        }
    }
})

redisClient.on("error", (error)=>{
    console.error("Redis xətası: ", error.message)
})
redisClient.on("connect", (error)=>{
    console.error("Redis bağlantısı qurulur...")
})
redisClient.on("ready", (error)=>{
    console.error("Redis hazırdır ")
})

async function connectRedis() {
    if(!redisClient.isOpen){
        await redisClient.connect()
    }
}

module.exports = {
    redisClient,
    connectRedis
}