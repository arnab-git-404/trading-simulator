const express = require("express");
const path = require("path");
const runSimulator = require("../services/tradeSimulator");
const calculateRateOfReturns = require("../services/calculateRateOfReturns");
const multiAssetsTrade = require("../services/multiAssetsTrade");

const router = express.Router();

const CSV_FILES = [
  path.join(__dirname, "../data/prices.csv"),
  path.join(__dirname, "../data/prices2.csv"),
  path.join(__dirname, "../data/prices3.csv"),
];

// Health check
router.get("/", (req, res) => {
  res.send("Trade Simulator Running");
});

// Question 1: simulation on single asset
router.get("/trade-simulate", async (req, res) => {
  try {
    const result = await runSimulator(CSV_FILES[0]);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Simulation failed", message: error.message });
  }
});

// Question 2: simulation on multiple assets
router.get("/multi-assets-trade", async (req, res) => {
  try {
    const result = await multiAssetsTrade(CSV_FILES);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Multi-asset simulation failed", message: error.message });
  }
});

// Question 3: daily and cumulative returns
router.get("/calculate-returns", async (req, res) => {
  try {
    const result = await calculateRateOfReturns(CSV_FILES[0]);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Returns calculation failed", message: error.message });
  }
});

module.exports = router;
