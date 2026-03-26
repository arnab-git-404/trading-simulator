# Trade Simulator

A Node.js application that simulates stock trading strategies using historical price data from CSV files. The application provides REST API endpoints to run trading simulations, calculate rate of returns, and analyze multiple assets.

## Project Structure

```
monkDev/
├── index.js              # Main server entry point
├── routes/
│   └── routes.js         # API route definitions
├── services/
│   ├── tradeSimulator.js         # Trading strategy logic
│   ├── calculateRateOfReturns.js # Returns calculator
│   └── multiAssetsTrade.js       # Multi-asset analysis
├── data/
│   ├── prices.csv        # Price data for asset 1
│   ├── prices2.csv       # Price data for asset 2
│   └── prices3.csv       # Price data for asset 3
├── package.json
└── README.md
```

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Code Explanation](#code-explanation)
  - [index.js](#indexjs---main-server)
  - [routes/routes.js](#routesroutesjs---api-routes)
  - [services/tradeSimulator.js](#servicestradesimulatorjs---trading-strategy)
  - [services/calculateRateOfReturns.js](#servicescalculaterateofreturnjs---returns-calculator)
  - [services/multiAssetsTrade.js](#servicesmultiassetstradejs---multi-asset-analysis)

---

## Installation

1. Clone or download the project
2. Install dependencies:

```bash
npm install
```

3. Make sure you have CSV files in the `data/` folder (`prices.csv`, `prices2.csv`, `prices3.csv`) with a `price` column

## Usage

Start the server:

```bash
npm start
```

The server runs on `http://localhost:3000`

---

## API Endpoints

| Endpoint              | Method | Description                                      |
| --------------------- | ------ | ------------------------------------------------ |
| `/`                   | GET    | Health check - returns "Trade Simulator Running" |
| `/trade-simulate`     | GET    | Run trading simulation on single asset           |
| `/multi-assets-trade` | GET    | Run simulation on multiple asset files           |
| `/calculate-returns`  | GET    | Calculate daily and cumulative returns           |

---

## Code Explanation

### index.js - Main Server

This is the entry point of the application. It sets up an Express.js server and connects the routes.

```javascript
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
```

**Explanation:**

- **Lines 1-2**: Import Express and our routes module
- **Lines 4-5**: Create Express app and define port
- **Line 7**: Mount all routes at the root path `/`
- **Lines 9-15**: Start server and display available endpoints

---

### routes/routes.js - API Routes

This module defines all API endpoints and connects them to the service functions.

```javascript
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
```

**Explanation:**

- **Lines 1-5**: Import Express, path module, and service functions
- **Line 7**: Create Express Router instance
- **Lines 9-13**: Define CSV file paths using `path.join(__dirname, ...)` for correct absolute paths
- **Lines 16-18**: Health check endpoint
- **Lines 21-30**: `/trade-simulate` - runs simulation with error handling
- **Lines 33-42**: `/multi-assets-trade` - runs multi-asset simulation
- **Lines 45-54**: `/calculate-returns` - calculates returns
- **Line 56**: Export router for use in index.js

---

### services/tradeSimulator.js - Trading Strategy

This module implements a simple trading strategy: **Buy when price drops 3%, Sell when profit reaches 5%**.

```javascript
const fs = require("fs");
const csv = require("csv-parser");

function runSimulator(csvFilePath, initialCapital = 10000) {
  return new Promise((resolve) => {
    // prices array to store prices from CSV
    const prices = [];

    // read the CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        // added each data to prices array after parsing
        prices.push(parseFloat(row.price));
      })
      .on("end", () => {
        let capital = initialCapital;

        // position means number of shares we currently own
        let position = 0;
        let buyPrice = 0;
        let tradeLog = [];

        // start from day 1
        for (let i = 1; i < prices.length; i++) {
          let todayPrice = prices[i];
          let yesterdayPrice = prices[i - 1];

          // we can only buy if we don't own any shares
          if (position === 0) {
            // calculate the difference in price drop
            let drop = ((yesterdayPrice - todayPrice) / yesterdayPrice) * 100;

            // if price dropped 3% or more then buy
            if (drop >= 3) {
              position = capital / todayPrice;
              buyPrice = todayPrice;
              capital = 0;

              // add to tradelog
              tradeLog.push({
                action: "BUY",
                price: todayPrice,
                day: i,
              });
            }
          }

          // we can only sell if we own shares (position > 0)
          else {
            // calculate our profit percentage
            let profit = ((todayPrice - buyPrice) / buyPrice) * 100;

            // if profit is 5% or more then sell
            if (profit >= 5) {
              capital = position * todayPrice; // convert shares back to cash
              position = 0;

              // add to tradelog
              tradeLog.push({
                action: "SELL",
                price: todayPrice,
                day: i,
              });
            }
          }
        }

        // If we still own shares at the end, sell them at the last price
        if (position > 0) {
          capital = position * prices[prices.length - 1];
        }

        resolve({
          tradeLog,
          initialCapital: initialCapital,
          finalCapital: capital,
        });
      });
  });
}

module.exports = runSimulator;
```

**Explanation:**

- **Lines 1-2**: Import `fs` for file reading and `csv-parser` for parsing CSV files
- **Line 4**: Function accepts a CSV file path and optional initial capital (default: $10,000)
- **Line 5**: Return a Promise to handle asynchronous file reading
- **Lines 10-15**: Read the CSV file and extract prices into an array
- **Lines 17-22**: Initialize trading variables:
  - `capital`: Available cash
  - `position`: Number of shares held
  - `buyPrice`: Price at which we bought
  - `tradeLog`: Array to record all trades
- **Lines 25-27**: Loop through prices starting from day 1 (need yesterday's price to compare)
- **Lines 30-47**: **BUY Logic** - If we have no position and price dropped ≥3% from yesterday:
  - Calculate how many shares we can buy with our capital
  - Record the buy price
  - Set capital to 0 (all invested)
  - Log the trade
- **Lines 50-66**: **SELL Logic** - If we have a position and profit ≥5%:
  - Convert shares back to capital
  - Reset position to 0
  - Log the trade
- **Lines 69-72**: At the end, if we still hold shares, convert to capital at final price
- **Lines 74-78**: Return the trade log, initial capital, and final capital

**Example - `/trade-simulate` Response:**

```json
{
  "tradeLog": [
    { "action": "BUY", "price": 97.5, "day": 3 },
    { "action": "SELL", "price": 102.5, "day": 7 }
  ],
  "initialCapital": 10000,
  "finalCapital": 10512.82
}
```

---

### services/calculateRateOfReturns.js - Returns Calculator

This module calculates daily returns and cumulative returns from price data.

```javascript
const fs = require("fs");
const csv = require("csv-parser");

async function calculateRateOfReturns(csvFilePath) {
  return new Promise((resolve, reject) => {
    const prices = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        prices.push(parseFloat(row.price));
      })
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        let dailyReturns = [];

        // total return from start
        let cumulativeReturns = [];

        // calculate daily returns
        for (let i = 1; i < prices.length; i++) {
          let todayPrice = prices[i];
          let yesterdayPrice = prices[i - 1];

          // if yesterday=100, today=105 → (105-100)/100 = 0.05 (5% gain)
          let daily = (todayPrice - yesterdayPrice) / yesterdayPrice;
          dailyReturns.push(daily);
        }

        // calculate cumulative returns
        let firstPrice = prices[0];
        for (let i = 0; i < prices.length; i++) {
          let currentPrice = prices[i];

          // if first=100, current=120 → (120-100)/100 = 0.20 (20% total gain)
          let cumulative = (currentPrice - firstPrice) / firstPrice;
          cumulativeReturns.push(cumulative);
        }

        resolve({
          dailyReturns,
          cumulativeReturns,
        });
      });
  });
}

module.exports = calculateRateOfReturns;
```

**Explanation:**

- **Lines 4-5**: Async function that returns a Promise for handling stream-based CSV reading
- **Lines 8-11**: Read CSV file and parse prices into an array
- **Lines 13-15**: Error handling - reject the Promise if file reading fails
- **Lines 17-20**: Initialize arrays for daily and cumulative returns
- **Lines 23-30**: **Daily Returns Calculation**:
  - Formula: `(today's price - yesterday's price) / yesterday's price`
  - This gives the percentage change from one day to the next
  - Example: If yesterday was $100 and today is $105, daily return = 0.05 (5%)
- **Lines 33-40**: **Cumulative Returns Calculation**:
  - Formula: `(current price - first price) / first price`
  - This shows total return since the beginning
  - Example: If first price was $100 and current is $120, cumulative return = 0.20 (20%)
- **Lines 42-45**: Resolve the Promise with both return arrays

**Example - `/calculate-returns` Response:**

```json
{
  "dailyReturns": [0.02, -0.03, 0.01, ...],
  "cumulativeReturns": [0, 0.02, -0.01, 0.005, ...]
}
```

---

### services/multiAssetsTrade.js - Multi-Asset Analysis

This module runs the trading simulation across multiple asset files and aggregates the results.

```javascript
const runSimulator = require('./tradeSimulator');

async function multiAssetsTrade(files) {
    let totalCapital = 0;
    let results = [];

    for (let file of files) {
        let result = await runSimulator(file, 10000);
        results.push({
            file: file,
            finalCapital: result.finalCapital
        });

        totalCapital += result.finalCapital;
    }

    return {
        results,
        totalCombinedCapital: totalCapital,
        totalPnL: totalCapital - (files.length * 10000)
    };
}

module.exports = multiAssetsTrade;
```

**Explanation:**

- **Line 1**: Import the trade simulator function
- **Line 3**: Async function that accepts an array of CSV file paths
- **Lines 4-5**: Initialize total capital counter and results array
- **Lines 7-15**: Loop through each file:
  - Run the simulator with $10,000 initial capital
  - Store the file name and final capital in results
  - Add to running total
- **Lines 17-21**: Return an object containing:
  - `results`: Array of individual asset performance
  - `totalCombinedCapital`: Sum of all final capitals
  - `totalPnL`: Total Profit and Loss (final total minus initial investment across all files)

**Example - `/multi-assets-trade` Response:**

```json
{
  "results": [
    { "file": "prices.csv", "finalCapital": 10500 },
    { "file": "prices2.csv", "finalCapital": 10800 },
    { "file": "prices3.csv", "finalCapital": 9700 }
  ],
  "totalCombinedCapital": 31000,
  "totalPnL": 1000
}
```

---

## Dependencies

| Package    | Version  | Purpose                 |
| ---------- | -------- | ----------------------- |
| express    | ^5.2.1   | Web server framework    |
| csv-parser | ^3.2.0   | Parse CSV files         |
| nodemon    | ^3.1.14  | Auto-restart during dev |

---

## CSV File Format

The CSV files in the `data/` folder should have at least a `price` column:

```csv
price
100
102
99
97
101
106
```
