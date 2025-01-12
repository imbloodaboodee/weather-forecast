const apiKey = '73d2fa90018f470684d203448240805';
const weatherIcons = ['./images/sunny-icon.png', './images/cloudy-icon.png', './images/rainy-icon.png', './images/snowy-icon.png', './images/partly-cloudy-icon.png', './images/storm-icon.png', './images/light-icon.png', './images/heavy-rain-icon.png'];

async function fetchWeather(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to retrieve weather data.');
        }
        return await response.json();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        alert('Failed to retrieve weather data. Please check the console for more details.');
        return null;
    }
}

function buildUrl(query, type = 'forecast') {
    const base = `https://api.weatherapi.com/v1/${type}.json`;
    console.log(`${base}?key=${apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=yes`);
    return `${base}?key=${apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=yes`;
}

async function getCurrentWeatherByCity(event) {
    event.preventDefault(); 
    const city = document.getElementById('city').value.trim();
    if (!city) {
        alert('Please enter a city');
        return;
    }
    const url = buildUrl(city);

    try {
        const data = await fetchWeather(url);
        if (data) {
            updateMainWeatherInfo(data);
            updateWeekCard(data);
            updateHighlightCard(data);
            renderTemperatureChart(data);
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function fetchWeatherByCoordinates(lat, lon) {
    const url = buildUrl(`${lat},${lon}`);

    try {
        const data = await fetchWeather(url);
        if (data) {
            updateMainWeatherInfo(data);
            updateWeekCard(data);
            updateHighlightCard(data);
            renderTemperatureChart(data);

        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}


async function getCurrentLocationAndFetchWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherByCoordinates(latitude, longitude);
        }, error => {
            alert(`Unable to retrieve your location: ${error.message}`);
        }, {
            timeout: 10000,
            maximumAge: 600000,
            enableHighAccuracy: true
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}


function updateMainWeatherInfo(data) {
    const mainWeatherInfo = document.getElementById('main-weather-info');
    const temperature = data.current.temp_c;
    const iconIndex = getIconIndex(data.current.condition.code);
    const icon = weatherIcons[iconIndex] || './images/default-icon.png'; 
    const description = data.current.condition.text;
    const currentDate = new Date(data.location.localtime);
    const dayOfWeek = currentDate.toLocaleString('en', { weekday: 'long' });

    const mainWeatherHTML = `
        <div class="form-floating mb-3 d-flex align-items-center justify-self-center">
            <img src="./images/location-icon.png" alt="Location" class="location-button" onclick="getCurrentLocationAndFetchWeather();">
            <form id="city-form" onsubmit="getCurrentWeatherByCity(event); return false;">
                <input type="text" id="city" placeholder="${data.location.name}" required>
            </form>
        </div>
        <div class="text-center justify-content-center">
            <img src="${icon}" class="img-fluid main-weather-icon" alt="${description}">
            <div id="main-temperature" class="h1 mt-2 mb-0">${temperature}°C</div>
            <div id="time-date" class="h6 mb-2">${dayOfWeek}, ${getCurrentTime()}</div>
            <div id="description" class="text-muted">${description}</div>
        </div>`;

    mainWeatherInfo.innerHTML = mainWeatherHTML;
}

function updateWeekCard(forecastData) {
    const weekCard = document.getElementById("week-card-container");
    weekCard.innerHTML = '';
    for (let i = 1; i < 7; i++) {
        console.log(forecastData.forecast.forecastday.length);
        const day = forecastData.forecast.forecastday[i];
        const date = new Date(day.date);
        const weekday = date.toLocaleString('en', { weekday: 'short' });
        const iconIndex = getIconIndex(day.day.condition.code);
        const icon = weatherIcons[iconIndex] || './images/default-icon.png';
        const lowTemperature = day.day.mintemp_c;
        const highTemperature = day.day.maxtemp_c;

        weekCard.innerHTML += `<div class="card mb-3 week-card text-center"> 
            <p class="weekday">${weekday}</p>
            <img src="${icon}" class="img-fluid weather-icon" alt="Weather Icon">
            <div class="container d-flex flex-column justify-content-center text-center">
                <div class="d-flex justify-content-center">
                    <img src="./images/low-temperature-icon.png" class="img low-temperature-icon" alt="Weather Icon">
                    <p class="h6 ms-2">${lowTemperature}°C</p>
                </div>
                <div class="d-flex justify-content-center">
                    <img src="./images/high-temperature-icon.png" class="img high-temperature-icon" alt="Weather Icon">
                    <p class="h6 ms-2">${highTemperature}°C</p>
                </div>
            </div>
        </div>`;
    }
}



function updateHighlightCard(currentData) {
    const uvIndex = currentData.current.uv;
    const windSpeed = currentData.current.wind_kph;
    const humidity = currentData.current.humidity;
    const visibility = currentData.current.vis_km;
    const airQuality = currentData.current.air_quality.pm2_5;

    const todayForecast = currentData.forecast.forecastday[0];
    const sunrise = todayForecast.astro.sunrise;
    const sunset = todayForecast.astro.sunset;
    const uvIndexHTML = `<div class="col card highlight-card">
        <div class="container align-items-center">
            <div class="row py-5 align-items-center">
                <div class="col-sm-5 align-items-center">
                    <img src="./images/uv-index-icon.png" class="card-img-fluid highlight-icon" alt="UV Index Icon">
                </div>
                <div class="col-sm-7 d-flex flex-column justify-content-center">
                    <p class="h1 align-self-center">${uvIndex}</p>
                    <p class="h6 mx-2">UV Index</p>
                </div>
            </div>
        </div>
    </div>`;

    const windStatusHTML = `<div class="col card highlight-card">
        <div class="container highlight-card">
            <div class="row py-5 align-items-center">
                <div class="col-sm-5">
                    <img src="./images/wind-icon.png" class="card-img highlight-icon" alt="Wind Icon">
                </div>
                <div class="col-sm-7 d-flex align-items-center justify-content-center text-center">
                    <div class="d-flex m-4 align-items-center justify-content-center text-center">
                        <p class="h1 ">${windSpeed}</p>
                        <p class="h5 mx-2">km/h</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    const sunRiseSunSetHTML = `<div class="col card highlight-card">
        <div class="container">
            <div class="row py-4 align-items-center justify-content-center">
                <div class="col-md-6">
                    <div class="d-flex flex-column align-items-center justify-content-center">
                        <img src="./images/sunrise-icon.png" class="card-img highlight-icon" alt="Sunrise Icon">
                        <div class="d-flex justify-content-center my-2">
                            <p class="h4">${sunrise}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="d-flex flex-column align-items-center justify-content-center">
                        <img src="./images/sunset-icon.png" class="card-img highlight-icon" alt="Sunset Icon">
                        <div class="d-flex justify-content-center my-2">
                            <p class="h4">${sunset}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    const humidityHTML = `<div class="col card highlight-card">
        <div class="container">
            <div class="row py-5 align-items-center">
                <div class="col-sm-5">
                    <img src="./images/humidity-icon.png" class="card-img highlight-icon" alt="Humidity Icon">
                </div>
                <div class="col-sm-7 d-flex align-items-center justify-content-center text-center">
                    <div class="d-flex m-4 align-items-center justify-content-center text-center">
                        <p class="h1 ">${humidity}</p>
                        <p class="h5 mx-2">%</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    const visibilityHTML = `<div class="col card highlight-card">
        <div class="container">
            <div class="row py-5">
                <div class="col-sm-5">
                    <img src="./images/visibility-icon.png" class="card-img highlight-icon" alt="Visibility Icon">
                </div>
                <div class="col-sm-7 d-flex align-items-center justify-content-center text-center">
                    <div class="d-flex align-items-center justify-content-center text-center">
                        <p class="h1">${visibility}</p>
                        <p class="h5 mx-2">km</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    const airQualityHTML = `<div class="col card highlight-card">
        <div class="container">
            <div class="row py-5">
                <div class="col-sm-5">
                    <img src="./images/air-quality-icon.png" class="card-img highlight-icon" alt="Air Quality Icon">
                </div>
                <div class="col-sm-7 d-flex align-items-center justify-content-center text-center">
                    <div class="d-flex align-items-center justify-content-center text-center">
                        <p class="h1 ">${airQuality}</p>
                        <p class="h6 mx-2">PM2.5</p>

                    </div>
                </div>
            </div>
        </div>
    </div>`;

    const highlightCardHTML = uvIndexHTML + windStatusHTML + sunRiseSunSetHTML + humidityHTML + visibilityHTML + airQualityHTML;
    highlightCardContainer.innerHTML = highlightCardHTML;
}



const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const today = new Date();
const currentDayIndex = today.getDay();
const weekCard = document.getElementById("week-card-container");
const highlightCardContainer = document.getElementById("highlight-card-container");



function getIconIndex(code) {
    switch (code) {
        case 1000: // Clear
            return 0; // sunny-icon.png
        case 1003: // Partly cloudy
            return 4; // partly-cloudy-icon.png
        case 1006: // Cloudy
            return 1; // cloudy-icon.png
        case 1009: // Overcast
            return 1; // cloudy-icon.png
        case 1030: // Mist
        case 1135: // Fog
        case 1147: // Freezing fog
            return 1; // cloudy-icon.png
        case 1063: // Patchy rain possible
        case 1180: // Patchy light rain
        case 1183: // Light rain
            return 7; // light-icon.png
        case 1066: // Patchy snow possible
        case 1210: // Patchy light snow
        case 1213: // Light snow
            return 3; // snowy-icon.png
        case 1069: // Patchy sleet possible
        case 1204: // Light sleet
        case 1249: // Light sleet showers
            return 3; // snowy-icon.png
        case 1072: // Patchy freezing drizzle possible
        case 1168: // Freezing drizzle
        case 1171: // Heavy freezing drizzle
            return 7; // light-icon.png
        case 1087: // Thundery outbreaks possible
            return 5; // storm-icon.png
        case 1150: // Patchy light drizzle
        case 1153: // Light drizzle
            return 7; // light-icon.png
        case 1186: // Moderate rain at times
        case 1189: // Moderate rain
            return 2; // rainy-icon.png
        case 1192: // Heavy rain at times
        case 1195: // Heavy rain
            return 7; // heavy-rain-icon.png
        case 1198: // Light freezing rain
        case 1201: // Moderate or heavy freezing rain
            return 7; // heavy-rain-icon.png
        case 1207: // Heavy sleet
        case 1237: // Ice pellets
            return 3; // snowy-icon.png
        case 1240: // Light rain shower
        case 1243: // Moderate or heavy rain shower
            return 2; // rainy-icon.png
        case 1246: // Torrential rain shower
            return 8; // heavy-rain-icon.png
        case 1255: // Light snow showers
        case 1258: // Moderate or heavy snow showers
            return 3; // snowy-icon.png
        case 1261: // Light showers of ice pellets
        case 1264: // Moderate or heavy showers of ice pellets
            return 3; // snowy-icon.png
        case 1273: // Patchy light rain with thunder
        case 1276: // Moderate or heavy rain with thunder
            return 5; // storm-icon.png
        case 1279: // Patchy light snow with thunder
        case 1282: // Moderate or heavy snow with thunder
            return 5; // storm-icon.png
        default:
            return 0; // Default to sunny-icon.png if code is not matched
    }
}


async function renderTemperatureChart(data) {
    if (!data) return;

    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const remainingHoursData = data.forecast.forecastday[0].hour.filter(hour => {
        const hourTime = new Date(hour.time).getHours();
        return hourTime >= currentHour;
    });
    const temperatureData = {
        labels: remainingHoursData.map(hour => hour.time.slice(-5)),
        datasets: [{
            label: 'Temperature Variation',
            data: remainingHoursData.map(hour => hour.temp_c),
            fill: false,
            backgroundColor: "rgba(255, 165, 0, 1)",
            borderColor: "rgba(255, 165, 0, 1)",
            borderWidth: 2,
            pointRadius: 7,
        }]
    };

    if (temperatureData) {
        const ctx = document.getElementById('temperature-chart').getContext('2d');
        if (window.temperatureChart) {
            window.temperatureChart.destroy();
        }
        
        // Render the new chart
        window.temperatureChart = new Chart(ctx, {
            type: 'line',
            data: temperatureData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        },
                        min: 0 
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        enabled: 'hover'
                    }
                }
            }
        });
    }
}







function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}
function refresh() {
    weekCard.innerHTML = '';
}
getCurrentLocationAndFetchWeather();  
