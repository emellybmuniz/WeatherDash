const apiKey = '9ea1364837e6440ca11154920250909';
const apiUrl = 'http://api.weatherapi.com/v1/current.json';

const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleBackgroundBtn');
    const body = document.body;

    if (toggleButton && body) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('solid-background');
        });
    }
});


searchButton.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        fetchWeather(location);
    }
});


locationInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") { 
        const location = locationInput.value;
        if (location) {
            fetchWeather(location);
        }
    }
});

function fetchWeather(location) {
    const url = `${apiUrl}?key=${apiKey}&q=${location}&aqi=yes`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            locationElement.textContent = data.location.name;
            temperatureElement.textContent = `${Math.round(data.current.temp_c)}°C`;
            descriptionElement.textContent = data.current.condition.text;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}