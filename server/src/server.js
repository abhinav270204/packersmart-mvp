require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 PackersMart Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to receive leads and log OTP codes...\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
  } else {
    console.error("Server error:", err);
  }
});
