const cityDisplay = document.getElementById('city');
const temperatureDisplay = document.getElementById('temperature');
const descriptionDisplay = document.getElementById('description');
const coordinatesDisplay = document.getElementById('coordinates');
const dailyForecast = document.querySelector('.day-forecast');
const hourlyForecast = document.querySelector('.hourly-container');

const predefinedCity = 'Hatod';

// Function to fetch weather data from your server
function fetchWeatherData(city) {
    const apiUrl = `/weather?city=${city}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message);
                });
            }
            return response.json();
        })
        .then(data => {
            cityDisplay.textContent = data.city.name;
            const coordinates = `Latitude: ${data.city.coord.lat}, Longitude: ${data.city.coord.lon}`;
            coordinatesDisplay.textContent = coordinates;

            temperatureDisplay.textContent = `${data.list[0].main.temp}°C`;
            descriptionDisplay.textContent = data.list[0].weather[0].description;

            dailyForecast.innerHTML = '';
            for (let i = 0; i < 8; i += 8) {
                const dayForecast = data.list[i];
                const dayElement = document.createElement('div');
                dayElement.classList.add('day');

                let rainChance = false;
                let rainHours = [];
                for (let j = i; j < i + 8; j++) {
                    if (data.list[j].rain) {
                        rainChance = true;
                        const forecastDate = new Date(data.list[j].dt * 1000);
                        const time = forecastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        const nextHourForecast = new Date(forecastDate);
                        nextHourForecast.setHours(forecastDate.getHours() + 3);
                        const nextTime = nextHourForecast.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                        rainHours.push(`${time} to ${nextTime} on ${forecastDate.toLocaleDateString()}`);
                    }
                }

                dayElement.innerHTML = `
                    <h4>${new Date(dayForecast.dt * 1000).toLocaleDateString()}</h4>
                    <p>${dayForecast.weather[0].description}</p>
                    <p>${dayForecast.main.temp_min}°C - ${dayForecast.main.temp_max}°C</p>
                    <p>Chance of Rain: ${rainChance ? 'Yes' : 'No'}</p>
                    ${rainChance ? `<p>Rain expected during:<br>${rainHours.join('<br>')}</p>` : ''}
                `;
                dailyForecast.appendChild(dayElement);
            }

            hourlyForecast.innerHTML = '';
            for (let i = 0; i < data.list.length; i++) {
                const hourForecast = data.list[i];
                const hourElement = document.createElement('div');
                hourElement.classList.add('hour');

                const rainAmount = hourForecast.rain ? hourForecast.rain['1h'] : 0;

                const forecastDate = new Date(hourForecast.dt * 1000);
                const date = forecastDate.toLocaleDateString();
                const time = forecastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                const chanceOfRain = rainAmount > 0 ? `${rainAmount} mm` : 'No Rain';

                hourElement.innerHTML = `
                    <h4>${time} on ${date}</h4>
                    <p>${hourForecast.weather[0].description}</p>
                    <p>${hourForecast.main.temp}°C</p>
                `;
                hourlyForecast.appendChild(hourElement);
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert(`Error fetching weather data: ${error.message}`);
        });
}

// Fetch weather data for the predefined city
fetchWeatherData(predefinedCity);
