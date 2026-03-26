const fs = require("fs");
const csv = require("csv-parser");

function runSimulator(csvFilePath, initialCapital = 10000) {
  return new Promise((resolve) => {

    // prices array to store prices from CSV
    const prices = [];

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
            let dropPercentage = ((yesterdayPrice - todayPrice) / yesterdayPrice) * 100;

            // if price dropped 3% or more then buy
            if (dropPercentage >= 3) {
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
            // calculate profit percentage
            let profitPercentage = ((todayPrice - buyPrice) / buyPrice) * 100;

            // if profit is 5% or more then sell
            if (profitPercentage >= 5) {
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
