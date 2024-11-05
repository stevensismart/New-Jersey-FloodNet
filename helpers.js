function getDataPointsCount(interval) {
    const intervalMapping = {
        '1min': 60,
        '5min': 5 * 60,
        '15min': 15 * 60,
        '1hour': 15 * 240
    };
    return intervalMapping[interval] || 60;
}

function calculateMedian(values) {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);

    if (values.length % 2) {
        return values[half];
    }

    return (values[half - 1] + values[half]) / 2.0;
}

function getMedianData(data, batchSize) {
    const medianData = [];
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        medianData.push(calculateMedian(batch));
    }
    return medianData;
}