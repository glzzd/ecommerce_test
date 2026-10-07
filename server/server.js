const config = require("./src/config/env");
const { connectDB, disconnectDB } = require("./src/config/db");
const app = require("./src/app");
const User = require("./src/models/User.model");

let server;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      console.log(`Server ${config.port} nömrəli portda işləyir`);
    });

    return server;
  } catch (error) {
    console.error("Serveri başlatmaq mümkün olmadı: ", error.message);

    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} alındı. Server ilə əlaqə kəsilir...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server ilə əlaqə kəsildi!");

      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
}

async function testDatabase() {
  try {
    await connectDB();

    const user = await User.create({
        name: "Ilkin Guluzade",
        email: "ilkin@buta.az",
        password: "12345678"
    })

    console.log("İstifadəçi yaradıldı: ", user)

    await disconnectDB()

  } catch (error) {
    console.error("Test xətası: ", error.message);
    await disconnectDB()
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

startServer();
// testDatabase()