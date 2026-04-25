import Chart from 'chart.js/auto';

// --- Constants & Config ---
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const WMO_CODE_MAP = {
    0: { text: "Clear Sky", icon: "☀️" },
    1: { text: "Mainly Clear", icon: "🌤️" },
    2: { text: "Partly Cloudy", icon: "⛅" },
    3: { text: "Overcast", icon: "☁️" },
    45: { text: "Fog", icon: "🌫️" },
    48: { text: "Depositing Rime Fog", icon: "🌫️" },
    51: { text: "Light Drizzle", icon: "🌦️" },
    53: { text: "Moderate Drizzle", icon: "🌦️" },
    55: { text: "Dense Drizzle", icon: "🌦️" },
    61: { text: "Slight Rain", icon: "🌧️" },
    63: { text: "Moderate Rain", icon: "🌧️" },
    65: { text: "Heavy Rain", icon: "🌧️" },
    71: { text: "Slight Snow", icon: "❄️" },
    73: { text: "Moderate Snow", icon: "❄️" },
    75: { text: "Heavy Snow", icon: "❄️" },
    95: { text: "Thunderstorm", icon: "⛈️" }
};

// --- State ---
let currentCharts = {
    tempTrend: null,
    humidity: null,
    pressure: null
};

// --- DOM Elements ---
const searchInput = document.getElementById('city-search');
const searchBtn = document.getElementById('search-btn');
const resultsDropdown = document.getElementById('search-results');
const loader = document.getElementById('loader');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Default location: Chennai (since user is in +5:30)
    fetchWeatherData(13.0827, 80.2707, "Chennai, India");
    
    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});

async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    showLoader(true);
    try {
        const response = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=5`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            renderSearchResults(data);
        } else {
            alert("Location not found.");
        }
    } catch (error) {
        console.error("Search Error:", error);
    } finally {
        showLoader(false);
    }
}

function renderSearchResults(results) {
    resultsDropdown.innerHTML = '';
    resultsDropdown.classList.remove('hidden');

    results.forEach(res => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.textContent = res.display_name;
        div.onclick = () => {
            fetchWeatherData(res.lat, res.lon, res.display_name);
            resultsDropdown.classList.add('hidden');
            searchInput.value = '';
        };
        resultsDropdown.appendChild(div);
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!resultsDropdown.contains(e.target) && e.target !== searchInput) {
            resultsDropdown.classList.add('hidden');
        }
    }, { once: true });
}

async function fetchWeatherData(lat, lon, locationName) {
    showLoader(true);
    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure,visibility,uv_index',
            hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,surface_pressure',
            timezone: 'auto',
            past_days: 1,
            forecast_days: 7
        });

        const response = await fetch(`${WEATHER_URL}?${params.toString()}`);
        const data = await response.json();
        
        updateUI(data, locationName);
        renderCharts(data);
    } catch (error) {
        console.error("Weather Fetch Error:", error);
        alert("Failed to fetch weather data.");
    } finally {
        showLoader(false);
    }
}

function updateUI(data, locationName) {
    const current = data.current;
    const wmoInfo = WMO_CODE_MAP[current.weather_code] || { text: "Unknown", icon: "❓" };

    // Update Main Card
    document.getElementById('current-city-name').textContent = locationName.split(',')[0];
    document.getElementById('current-temp').textContent = Math.round(current.temperature_2m);
    document.getElementById('condition-text').textContent = wmoInfo.text;
    document.getElementById('weather-icon-main').textContent = wmoInfo.icon;

    // Update Mini Stats
    document.getElementById('humidity-val').textContent = current.relative_humidity_2m;
    document.getElementById('wind-val').textContent = current.wind_speed_10m;
    document.getElementById('uv-val').textContent = current.uv_index;
    document.getElementById('vis-val').textContent = (current.visibility / 1000).toFixed(1);
}

function renderCharts(data) {
    const hourly = data.hourly;
    const labels = hourly.time.slice(0, 72).map(t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    // 1. Temperature Trend (Last 24h + Next 48h)
    initChart('tempTrendChart', 'tempTrend', {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: hourly.temperature_2m.slice(0, 72),
                borderColor: '#00f2ff',
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: getChartOptions('Temperature Trend Line', '°C')
    });

    // 2. Humidity vs Precipitation
    initChart('humidityAnalysisChart', 'humidity', {
        type: 'bar',
        data: {
            labels: labels.filter((_, i) => i % 3 === 0), // Sample every 3 hours
            datasets: [
                {
                    label: 'Humidity (%)',
                    data: hourly.relative_humidity_2m.slice(0, 72).filter((_, i) => i % 3 === 0),
                    backgroundColor: 'rgba(112, 0, 255, 0.5)',
                    borderRadius: 4
                },
                {
                    label: 'Rain Prob (%)',
                    data: hourly.precipitation_probability.slice(0, 72).filter((_, i) => i % 3 === 0),
                    backgroundColor: 'rgba(0, 242, 255, 0.5)',
                    borderRadius: 4
                }
            ]
        },
        options: getChartOptions('Atmospheric Moisture Analysis', '%')
    });

    // 3. Pressure Variance
    initChart('pressureChart', 'pressure', {
        type: 'line',
        data: {
            labels: labels.filter((_, i) => i % 6 === 0),
            datasets: [{
                label: 'Pressure (hPa)',
                data: hourly.surface_pressure.slice(0, 72).filter((_, i) => i % 6 === 0),
                borderColor: '#ffffff',
                borderWidth: 2,
                pointBackgroundColor: '#00f2ff',
                pointRadius: 4,
                tension: 0.2
            }]
        },
        options: getChartOptions('Barometric Pressure', 'hPa')
    });
}

function initChart(canvasId, chartKey, config) {
    if (currentCharts[chartKey]) {
        currentCharts[chartKey].destroy();
    }
    const ctx = document.getElementById(canvasId).getContext('2d');
    currentCharts[chartKey] = new Chart(ctx, config);
}

function getChartOptions(title, unit) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, labels: { color: '#a0a0c0', font: { family: 'Outfit', size: 10 } } },
            tooltip: {
                backgroundColor: 'rgba(5, 11, 26, 0.9)',
                titleFont: { family: 'Outfit' },
                bodyFont: { family: 'Outfit' },
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.parsed.y}${unit}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#606080', font: { size: 10 } }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#606080', font: { size: 10 } }
            }
        }
    };
}

function showLoader(show) {
    loader.classList.toggle('hidden', !show);
}
