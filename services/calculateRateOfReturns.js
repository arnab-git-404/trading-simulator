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
