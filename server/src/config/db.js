const mongoose = require("mongoose");
const config = require("./env");

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUrl, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB bağlantısı uğurludur");
  } catch (error) {
    console.error("MongoDB bağlantı xətası: ", error.message);
    throw error;
  }
}

async function disconnectDB() {
    await mongoose.disconnect()

    console.log("MongoDB bağlantısı kəsildi");
    
    
}


module.exports = {
    connectDB,
    disconnectDB
};
