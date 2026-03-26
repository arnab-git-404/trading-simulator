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