const express = require("express");
const routes = require("./routes/routes");

const app = express();
const PORT = 3000;

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}\n`);
  console.log("API Endpoints:");
  console.log(`  http://localhost:${PORT}/trade-simulate`);
  console.log(`  http://localhost:${PORT}/multi-assets-trade`);
  console.log(`  http://localhost:${PORT}/calculate-returns`);
});
