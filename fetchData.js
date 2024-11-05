async function fetchDataForAllSensors() {
    const fetchPromises = sensorCoordinates.map((coords, index) => {
        const RANGE = `V4 Sensor ${coords.number} Graph!A:F`;  // Include the sheet range properly
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SECRETS.SPREADSHEET_ID}/values/${RANGE}?key=${SECRETS.API_KEY}`;
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data for sensor ${coords.number}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Fetched data for sensor ${coords.number}:`, data.values);
                sensorData[index] = data.values.slice(1).map(row => ({
                    timestamp: new Date(row[0]),
                    waterLevelMM: parseFloat(row[1]),
                    waterLevelInches: parseFloat(row[2]),
                    rainAccumulationMM: parseFloat(row[3]),
                    rainAccumulationInches: parseFloat(row[4]),
                    errorCode: parseInt(row[5])  // Add errorCode from column F
                })).filter(data => data.rainAccumulationMM !== 650.25); // Exclude erroneous data
                coords.errorCode = sensorData[index][sensorData[index].length - 1]?.errorCode || 0;
            })
            .catch(error => {
                console.error(`Error fetching data for sensor ${coords.number}:`, error);
            });
    });

    await Promise.all(fetchPromises);
    console.log('All data fetched successfully.');
}