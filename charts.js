
function createCharts(index, marker, coordinates) {
    const parsedData = sensorData[index];
    if (!parsedData || parsedData.length === 0) {
        console.error(`No data available for sensor ${coordinates.number}`);
        return;
    }

    const dataPoints = getDataPointsCount(selectedInterval);
    const filteredData = parsedData.slice(-dataPoints);

    const labels = filteredData.map(entry => moment(entry.timestamp).format('MM-DD HH:mm'));  // Include date and time
    const waterLevelData = useInches ? filteredData.map(entry => entry.waterLevelInches.toFixed(2)) : filteredData.map(entry => entry.waterLevelMM.toFixed(2));
    const rainAccumulationData = useInches ? filteredData.map(entry => entry.rainAccumulationInches.toFixed(2)) : filteredData.map(entry => entry.rainAccumulationMM.toFixed(2));

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

    const tabContainer = document.createElement('div');
    tabContainer.className = 'tabs';

    const tabButtons = document.createElement('div');
    tabButtons.className = 'tab-buttons';

    const waterLevelTabButton = document.createElement('button');
    waterLevelTabButton.innerText = 'Water Level (AGL)';
    waterLevelTabButton.onclick = () => {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        waterLevelTab.classList.add('active');
        document.querySelectorAll('.tab-buttons button').forEach(btn => btn.classList.remove('active'));
        waterLevelTabButton.classList.add('active');
        toggleAveragingButton.disabled = true; // Disable averaging button for Water Level tab
    };

    const rainTabButton = document.createElement('button');
    rainTabButton.className = 'active';
    rainTabButton.innerText = 'Rain Accumulation';
    rainTabButton.onclick = () => {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        rainTab.classList.add('active');
        document.querySelectorAll('.tab-buttons button').forEach(btn => btn.classList.remove('active'));
        rainTabButton.classList.add('active');
        toggleAveragingButton.disabled = false; // Enable averaging button for Rain Accumulation tab
    };

    tabButtons.appendChild(waterLevelTabButton);
    tabButtons.appendChild(rainTabButton);
    tabContainer.appendChild(tabButtons);

    const waterLevelTab = document.createElement('div');
    waterLevelTab.className = 'tab-content';

    const rainTab = document.createElement('div');
    rainTab.className = 'tab-content active';

    const waterLevelCanvas = document.createElement('canvas');
    waterLevelCanvas.classList.add('chart-container');
    waterLevelCanvas.width = 600;
    waterLevelCanvas.height = 300;
    const waterLevelCtx = waterLevelCanvas.getContext('2d');
    const waterLevelChart = new Chart(waterLevelCtx, {
        type: 'line',
        data: {
            labels: labels.slice(0, displayedWaterLevelData.length),
            datasets: [{
                label: `Water Level`,
                data: displayedWaterLevelData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                showLine: false // This ensures only dots are shown
            }]
        },
        options: {
            responsive: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'MM-DD HH:mm',  // Parse both date and time
                        tooltipFormat: 'MM-DD HH:mm',
                        unit: 'minute',
                        displayFormats: {
                            minute: 'MM-DD HH:mm'  // Display both date and time
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Water Level (AGL)'
                    },
                    ticks: {
                        callback: function(value) {
                            return `${value.toFixed(2)} ${useInches ? 'inches' : 'mm'}`;
                        }
                    }
                }
            }
        }
    });

    const rainCanvas = document.createElement('canvas');
    rainCanvas.classList.add('chart-container');
    rainCanvas.width = 600;
    rainCanvas.height = 300;
    const rainCtx = rainCanvas.getContext('2d');
    const rainChart = new Chart(rainCtx, {
        type: 'line',
        data: {
            labels: labels.slice(0, displayedRainAccumulationData.length),
            datasets: [{
                label: `Rain Accumulation`,
                data: displayedRainAccumulationData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                showLine: false // This ensures only dots are shown
            }]
        },
        options: {
            responsive: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'MM-DD HH:mm',  // Parse both date and time
                        tooltipFormat: 'MM-DD HH:mm',
                        unit: 'minute',
                        displayFormats: {
                            minute: 'MM-DD HH:mm'  // Display both date and time
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Rain Accumulation'
                    },
                    ticks: {
                        callback: function(value) {
                            return `${value.toFixed(2)} ${useInches ? 'inches' : 'mm'}`;
                        }
                    }
                }
            }
        }
    });

    waterLevelTab.appendChild(waterLevelCanvas);
    rainTab.appendChild(rainCanvas);

    tabContainer.appendChild(waterLevelTab);
    tabContainer.appendChild(rainTab);

    charts[index] = { waterLevelChart, rainChart }; // Store chart references

    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';

    const errorStatus = coordinates.errorCode !== 0 ? "error-yes" : "error-no"; // Determine error status

    const dateElement = document.createElement('div');
    dateElement.className = 'popup-header';
    dateElement.innerHTML = `Sensor: ${coordinates.name} <span class="error-status">Status: <div class="error-circle ${errorStatus}"></div></span><br>Date: ${moment().tz('America/New_York').format('YYYY-MM-DD')} Time: ${moment().tz('America/New_York').format('HH:mm')} (EDT)`;
    popupContent.appendChild(dateElement);

    const intervalSelectContainer = document.createElement('div');
    intervalSelectContainer.className = 'interval-select-container';
    const intervalSelect = document.createElement('select');
    const intervals = ['1min', '5min', '15min', '1hour'];
    intervals.forEach(interval => {
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

    // Create the toggleAveragingButton
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

    popupContent.appendChild(tabContainer);
    popupContent.appendChild(intervalSelectContainer);

    const downloadButtons = document.createElement('div');
    downloadButtons.className = 'download-buttons';

    const downloadJSONButton = document.createElement('button');
    downloadJSONButton.innerText = 'Download JSON';
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

    const downloadWaterLevelPNGButton = document.createElement('button');
    downloadWaterLevelPNGButton.innerText = 'Download Water Level PNG';
    downloadWaterLevelPNGButton.onclick = () => {
        const link = document.createElement('a');
        link.href = waterLevelChart.toBase64Image();
        link.download = `sensor_${coordinates.number}_water_level.png`;
        link.click();
    };

    const downloadRainPNGButton = document.createElement('button');
    downloadRainPNGButton.innerText = 'Download Rain PNG';
    downloadRainPNGButton.onclick = () => {
        const link = document.createElement('a');
        link.href = rainChart.toBase64Image();
        link.download = `sensor_${coordinates.number}_rain.png`;
        link.click();
    };

    downloadButtons.appendChild(downloadJSONButton);
    downloadButtons.appendChild(downloadWaterLevelPNGButton);
    downloadButtons.appendChild(downloadRainPNGButton);

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

function updateCharts() {
    fetchDataForAllSensors().then(() => {
        Object.keys(charts).forEach(index => {
            const parsedData = sensorData[index];
            const { waterLevelChart, rainChart } = charts[index];

            const dataPoints = getDataPointsCount(selectedInterval);
            const filteredData = parsedData.slice(-dataPoints);

            const labels = filteredData.map(entry => moment(entry.timestamp).format('MM-DD HH:mm'));  // Include date and time
            const waterLevelData = useInches ? filteredData.map(entry => entry.waterLevelInches.toFixed(2)) : filteredData.map(entry => entry.waterLevelMM.toFixed(2));
            const rainAccumulationData = useInches ? filteredData.map(entry => entry.rainAccumulationInches.toFixed(2)) : filteredData.map(entry => entry.rainAccumulationMM.toFixed(2));

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

            waterLevelChart.data.labels = labels.slice(0, displayedWaterLevelData.length);
            waterLevelChart.data.datasets[0].data = displayedWaterLevelData;
            waterLevelChart.update();

            rainChart.data.labels = labels.slice(0, displayedRainAccumulationData.length);
            rainChart.data.datasets[0].data = displayedRainAccumulationData;
            rainChart.update();
        });
    });
}
