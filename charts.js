function createCharts(index, marker, coordinates) {
    const parsedData = sensorData[index];
    if (!parsedData || parsedData.length === 0) {
        console.error(`No data available for sensor ${coordinates.number}`);
        return;
    }

    const dataPoints = getDataPointsCount(selectedInterval);
    const filteredData = parsedData.slice(-dataPoints);

    const labels = filteredData.map(entry => moment(entry.timestamp).format('MM-DD HH:mm'));
    const waterLevelData = useInches ? filteredData.map(entry => entry.waterLevelInches.toFixed(2)) : filteredData.map(entry => entry.waterLevelMM.toFixed(2));
    const rainAccumulationData = useInches ? filteredData.map(entry => entry.rainAccumulationInches.toFixed(2)) : filteredData.map(entry => entry.rainAccumulationMM.toFixed(2));
    const voltageData = filteredData.map(entry => parseFloat(entry.voltage));

    let displayedWaterLevelData = waterLevelData;
    let displayedRainAccumulationData = rainAccumulationData;

    if (selectedInterval !== '1min' && applyAveraging) {
        const intervalMultiplier = {
            '5min': 5,
            '15min': 15,
            '1hour': 15
        }[selectedInterval];
        displayedWaterLevelData = getMedianData(waterLevelData, intervalMultiplier);
        displayedRainAccumulationData = getMedianData(rainAccumulationData, intervalMultiplier);
    }

    // Create combined chart with dual Y-axes
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.classList.add('chart-container');
    combinedCanvas.width = 600;
    combinedCanvas.height = 300;
    const combinedCtx = combinedCanvas.getContext('2d');

    const combinedChart = new Chart(combinedCtx, {
        type: 'line',
        data: {
            labels: labels.slice(0, displayedWaterLevelData.length),
            datasets: [
                {
                    label: 'Water Level',
                    data: displayedWaterLevelData,
                    borderColor: 'rgba(255, 99, 132, 1)',  // Pink color
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'yWaterLevel',
                    borderWidth: 1,
                    showLine: false,  // Disable connecting lines
                    pointRadius: 3    // Set point size
                },
                {
                    label: 'Rain Accumulation',
                    data: displayedRainAccumulationData,
                    borderColor: 'rgba(54, 162, 235, 1)',  // Blue color
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'yRain',
                    borderWidth: 1,
                    showLine: false,  // Disable connecting lines
                    pointRadius: 3    // Set point size
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'MM-DD HH:mm',
                        tooltipFormat: 'MM-DD HH:mm',
                        unit: 'minute',
                        displayFormats: {
                            minute: 'MM-DD HH:mm'
                        }
                    }
                },
                yWaterLevel: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: `Water Level (${useInches ? 'inches' : 'mm'})`,
                        color: 'rgba(255, 99, 132, 1)'  // Pink color for axis title
                    },
                    ticks: {
                        callback: value => value < 0 ? '' : `${value} ${useInches ? 'in' : 'mm'}`,  // Hide negative labels
                        color: 'rgba(255, 99, 132, 1)'  // Pink color for ticks
                    },
                    grid: {
                        color: 'rgba(255, 99, 132, 0.2)'  // Pink color for grid lines
                    },
                    suggestedMin: -0.01,  // Fixed margin just below 0
                    suggestedMax: Math.max(...displayedWaterLevelData) + 0.05   // Small margin above the highest point
                },
                yRain: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: `Rain Accumulation (${useInches ? 'inches' : 'mm'})`,
                        color: 'rgba(54, 162, 235, 1)'  // Blue color for axis title
                    },
                    ticks: {
                        callback: value => value < 0 ? '' : `${value} ${useInches ? 'in' : 'mm'}`,  // Hide negative labels
                        color: 'rgba(54, 162, 235, 1)'  // Blue color for ticks
                    },
                    grid: {
                        drawOnChartArea: false  // Disables grid lines for the right axis
                    },
                    suggestedMin: -0.01,  // Fixed margin just below 0
                    suggestedMax: Math.max(...displayedRainAccumulationData) + 0.05   // Small margin above the highest point
                }
            }
        }
    });

    // Voltage Chart
    const voltageCanvas = document.createElement('canvas');
    voltageCanvas.classList.add('chart-container');
    voltageCanvas.width = 600;
    voltageCanvas.height = 300;
    const voltageCtx = voltageCanvas.getContext('2d');

    const voltageChart = new Chart(voltageCtx, {
        type: 'line',
        data: {
            labels: labels.slice(0, voltageData.length),
            datasets: [
                {
                    label: 'Voltage Level',
                    data: voltageData,
                    borderColor: 'rgba(75, 192, 192, 1)',  // Cyan color
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 1,
                    showLine: false,
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'MM-DD HH:mm',
                        tooltipFormat: 'MM-DD HH:mm',
                        unit: 'minute',
                        displayFormats: {
                            minute: 'MM-DD HH:mm'
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Voltage (V)'
                    },
                    ticks: {
                        callback: value => `${value} V`
                    }
                }
            }
        }
    });

    charts[index] = { combinedChart, voltageChart }; // Store chart references

    // Popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';

    // Error status and date element
    const errorStatus = coordinates.errorCode !== 0 ? "error-yes" : "error-no";
    const dateElement = document.createElement('div');
    dateElement.className = 'popup-header';
    dateElement.innerHTML = `Sensor: ${coordinates.name} <span class="error-status">Status: <div class="error-circle ${errorStatus}"></div></span><br>Date: ${moment().tz('America/New_York').format('YYYY-MM-DD')} Time: ${moment().tz('America/New_York').format('HH:mm')} (EDT)`;
    popupContent.appendChild(dateElement);

// Tab Buttons
const tabButtons = document.createElement('div');
tabButtons.className = 'tab-buttons';

const dataTabButton = document.createElement('button');
dataTabButton.innerText = 'Sensor Data';
dataTabButton.className = 'tab-button active';  // Default active tab
dataTabButton.onclick = () => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    dataTab.classList.add('active');
    dataTabButton.classList.add('active');
    toggleMetricButton.disabled = false;  // Enable on Sensor Data tab
    toggleMetricButton.innerText = useInches ? 'Inches' : 'mm';
};

const voltageTabButton = document.createElement('button');
voltageTabButton.innerText = 'Battery Level';
voltageTabButton.className = 'tab-button';
voltageTabButton.onclick = () => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    voltageTab.classList.add('active');
    voltageTabButton.classList.add('active');
    toggleMetricButton.disabled = true;  // Disable on Voltage Level tab
    toggleMetricButton.innerText = 'Volt';
};

tabButtons.appendChild(dataTabButton);
tabButtons.appendChild(voltageTabButton);
popupContent.appendChild(tabButtons);


    // Tab Contents
    const dataTab = document.createElement('div');
    dataTab.classList.add('tab-content', 'active');  // Show data tab by default
    dataTab.appendChild(combinedCanvas);

    const voltageTab = document.createElement('div');
    voltageTab.classList.add('tab-content');
    voltageTab.appendChild(voltageCanvas);

    popupContent.appendChild(dataTab);
    popupContent.appendChild(voltageTab);

    // Interval and Averaging Toggles
    const intervalSelectContainer = document.createElement('div');
    intervalSelectContainer.className = 'interval-select-container';
    const intervalSelect = document.createElement('select');
    ['1min', '5min', '15min', '1hour'].forEach(interval => {
        const option = document.createElement('option');
        option.value = interval;
        option.innerText = interval;
        intervalSelect.appendChild(option);
    });
    intervalSelect.value = selectedInterval;
    intervalSelect.onchange = () => {
        selectedInterval = intervalSelect.value;
        updateCharts();
    };
    intervalSelectContainer.appendChild(intervalSelect);

    const toggleAveragingButton = document.createElement('button');
    toggleAveragingButton.innerText = applyAveraging ? 'Averaging' : 'All Data';
    toggleAveragingButton.onclick = () => {
        applyAveraging = !applyAveraging;
        toggleAveragingButton.innerText = applyAveraging ? 'Averaging' : 'All Data';
        updateCharts();
    };
    intervalSelectContainer.appendChild(toggleAveragingButton);

    const toggleMetricButton = document.createElement('button');
    toggleMetricButton.innerText = useInches ? 'Inches' : 'mm';
    toggleMetricButton.onclick = () => {
        useInches = !useInches;
        toggleMetricButton.innerText = useInches ? 'Inches' : 'mm';
        updateCharts();
    };
    intervalSelectContainer.appendChild(toggleMetricButton);

    // Download buttons
    const downloadButtons = document.createElement('div');
    downloadButtons.className = 'download-buttons';

    const downloadJSONButton = document.createElement('button');
    downloadJSONButton.innerText = 'Download Data (JSON)';
    downloadJSONButton.onclick = () => {
        const jsonData = {
            sensor: coordinates.name,
            coordinates: coordinates,
            data: filteredData
        };
        const json = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sensor_${coordinates.number}_data.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadFigureButton = document.createElement('button');
    downloadFigureButton.innerText = 'Download Data (Figure.png)';
    downloadFigureButton.onclick = () => {
        const activeChart = voltageTab.classList.contains('active') ? voltageChart : combinedChart;
        const link = document.createElement('a');
        link.href = activeChart.toBase64Image();
        link.download = `sensor_${coordinates.number}_figure.png`;
        link.click();
    };

    downloadButtons.appendChild(downloadJSONButton);
    downloadButtons.appendChild(downloadFigureButton);

    // Append interval controls and download buttons below the chart
    popupContent.appendChild(intervalSelectContainer);
    popupContent.appendChild(downloadButtons);

    if (marker.getPopup()) {
        marker.setPopupContent(popupContent);
    } else {
        marker.bindPopup(popupContent, {
            maxWidth: 800,
            maxHeight: 800
        }).openPopup();
    }
}

// Update charts with the latest data
// Update charts with the latest data without fetching again
function updateCharts() {
    Object.keys(charts).forEach(index => {
        const parsedData = sensorData[index];
        const { combinedChart, voltageChart } = charts[index];

        const dataPoints = getDataPointsCount(selectedInterval);
        const filteredData = parsedData.slice(-dataPoints);

        const labels = filteredData.map(entry => moment(entry.timestamp).format('MM-DD HH:mm'));
        const waterLevelData = useInches ? filteredData.map(entry => entry.waterLevelInches) : filteredData.map(entry => entry.waterLevelMM);
        const rainAccumulationData = useInches ? filteredData.map(entry => entry.rainAccumulationInches) : filteredData.map(entry => entry.rainAccumulationMM);
        const voltageData = filteredData.map(entry => parseFloat(entry.voltage));

        // Determine if we need to apply averaging for each data set
        let displayedWaterLevelData = waterLevelData;
        let displayedRainAccumulationData = rainAccumulationData;
        let displayedVoltageData = voltageData;

        if (applyAveraging && selectedInterval !== '1min') {
            const intervalMultiplier = {
                '5min': 5,
                '15min': 15,
                '1hour': 15
            }[selectedInterval];

            displayedWaterLevelData = getMedianData(waterLevelData, intervalMultiplier);
            displayedRainAccumulationData = getMedianData(rainAccumulationData, intervalMultiplier);
            displayedVoltageData = getMedianData(voltageData, intervalMultiplier);
        } else {
            displayedWaterLevelData = waterLevelData;
            displayedRainAccumulationData = rainAccumulationData;
            displayedVoltageData = voltageData;
        }

        // Update combined chart data
        combinedChart.data.labels = labels.slice(0, displayedWaterLevelData.length);
        combinedChart.data.datasets[0].data = displayedWaterLevelData.map(value => parseFloat(value.toFixed(2)));
        combinedChart.data.datasets[1].data = displayedRainAccumulationData.map(value => parseFloat(value.toFixed(2)));
        combinedChart.update();

        // Update voltage chart data
        voltageChart.data.labels = labels.slice(0, displayedVoltageData.length);
        voltageChart.data.datasets[0].data = displayedVoltageData.map(value => parseFloat(value.toFixed(2)));
        voltageChart.update();
    });
}

