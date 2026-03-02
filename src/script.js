document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const backdrop = document.getElementById("sidebarBackdrop");

  if (!sidebar || !sidebarToggle) return;

  function toggleSidebar() {
    sidebar.classList.toggle("-translate-x-full");
    if (backdrop) backdrop.classList.toggle("hidden");
    document.body.classList.toggle("overflow-hidden");
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
      dashboard.classList.toggle("overflow-y-auto");
      dashboard.classList.toggle("overflow-hidden");
    }
  }

  sidebarToggle.addEventListener("click", () => {
    toggleSidebar();
  });

  if (backdrop) {
    backdrop.addEventListener("click", toggleSidebar);
  }

  // Close menu when clicking a link on mobile
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (
        window.innerWidth < 1024 &&
        !sidebar.classList.contains("-translate-x-full")
      ) {
        toggleSidebar();
      }
    });
  });
});

function setActiveNav(sectionId) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.style.backgroundColor = "";
    link.style.color = "";
    link.classList.remove("active");
  });
  const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
  if (activeLink) {
    activeLink.style.backgroundColor = "var(--bg-tertiary)";
    activeLink.style.color = "var(--accent-color)";
    activeLink.classList.add("active");
  }
}

function handleNavClick(e) {
  const navLink = e.target.closest(".nav-link");
  if (navLink) {
    e.preventDefault();
    const href = navLink.getAttribute("href");
    if (href.startsWith("#")) {
      const sectionId = href.substring(1);
      setActiveNav(sectionId);

      const section = document.getElementById(sectionId);
      const scrollContainer = document.getElementById("dashboard");

      if (section && scrollContainer) {
        if (sectionId === "dashboard") {
          scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const top =
            section.getBoundingClientRect().top -
            scrollContainer.getBoundingClientRect().top +
            scrollContainer.scrollTop -
            60;
          scrollContainer.scrollTo({ top: top, behavior: "smooth" });
        }
      }
    }
  }
}

document.querySelector("nav").addEventListener("click", handleNavClick);

function onScrollHighlightNav() {
  const sections = ["dashboard", "forecast", "map"];
  let current = sections[0];
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < 120) {
      current = id;
    }
  }
  setActiveNav(current);
}

document.addEventListener("scroll", onScrollHighlightNav, true);
document.addEventListener("DOMContentLoaded", () => {
  setActiveNav("dashboard");
});

const apiKey = "9ea1364837e6440ca11154920250909";
const apiUrl = "https://api.weatherapi.com/v1/current.json";
const forecastUrl = "https://api.weatherapi.com/v1/forecast.json";

const locationInput = document.getElementById("locationInput");
const mainLocation = document.getElementById("mainLocation");
const currentLocationDisplay = document.getElementById(
  "currentLocationDisplay",
);

const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const uvElement = document.getElementById("uv");
const pressureElement = document.getElementById("pressure");
const feelsLikeElement = document.getElementById("feelsLike");
const weatherIconElement = document.getElementById("weatherIcon");
const currentDateElement = document.getElementById("currentDate");
const refreshBtn = document.getElementById("refreshBtn");
const saveLocationBtn = document.getElementById("saveLocationBtn");
const shareBtn = document.getElementById("shareBtn");
const forecastContainer = document.getElementById("forecastContainer");
const savedLocationsContainer = document.getElementById("savedLocations");
const suggestionsContainer = document.getElementById("suggestionsContainer");

function getUnitPreference() {
  const stored = localStorage.getItem("weatherDashUnit");
  if (stored) return stored;
  return navigator.language === "en-US" ? "imperial" : "metric";
}
function isImperial() {
  return getUnitPreference() === "imperial";
}
function tempDisplay(c, f) {
  return isImperial() ? `${Math.round(f)}°F` : `${Math.round(c)}°C`;
}
function windDisplay(kph, mph) {
  return isImperial() ? `${Math.round(mph)} mph` : `${Math.round(kph)} km/h`;
}

let lastSearchedLocation = "Rio de Janeiro";
let currentLocationData = null;
let fullForecastData = null;
let suggestionsTimeout = null;

let recommendationsData = null;
let recommendationsLoaded = false;
let recommendationsLoadingPromise = null;

function loadRecommendationsData() {
  if (recommendationsLoaded) return Promise.resolve(recommendationsData);
  if (recommendationsLoadingPromise) return recommendationsLoadingPromise;
  recommendationsLoadingPromise = fetch("./recomendations.json")
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao carregar recomendações");
      return res.json();
    })
    .then((data) => {
      recommendationsData = data;
      recommendationsLoaded = true;
      return recommendationsData;
    })
    .catch((err) => {
      recommendationsData = null;
      recommendationsLoaded = false;
      return {};
    });
  return recommendationsLoadingPromise;
}

function loadSavedLocations() {
  const saved = localStorage.getItem("savedLocations");
  return saved ? JSON.parse(saved) : [];
}

const weatherIconMap = {
  Sunny: "light_mode",
  "Partly cloudy": "partly_cloudy_day",
  Cloudy: "cloud",
  Overcast: "cloud_queue",
  Mist: "foggy",
  "Patchy rain possible": "rainy",
  "Patchy snow possible": "ac_unit",
  "Patchy sleet possible": "ac_unit",
  "Patchy freezing drizzle possible": "rainy",
  "Thundery outbreaks possible": "thunderstorm",
  Blizzard: "ac_unit",
  "Blizzard Patchy light snow with thunder": "thunderstorm",
  "Light drizzle": "rainy",
  "Freezing drizzle": "rainy",
  "Heavy freezing drizzle": "rainy",
  "Patchy light rain": "rainy",
  "Light rain": "rainy",
  "Moderate rain at times": "rainy",
  "Moderate rain": "rainy",
  "Heavy rain at times": "rainy",
  "Heavy rain": "rainy",
  "Light freezing rain": "rainy",
  "Moderate or heavy freezing rain": "rainy",
  "Light sleet": "ac_unit",
  "Moderate or heavy sleet": "ac_unit",
  "Patchy light snow": "ac_unit",
  "Light snow": "ac_unit",
  "Patchy moderate snow": "ac_unit",
  "Moderate snow": "ac_unit",
  "Patchy heavy snow": "ac_unit",
  "Heavy snow": "ac_unit",
  "Light rain shower": "rainy",
  "Moderate or heavy rain shower": "rainy",
  "Torrential rain shower": "rainy",
  "Light sleet showers": "ac_unit",
  "Moderate or heavy sleet showers": "ac_unit",
  "Light snow showers": "ac_unit",
  "Moderate or heavy snow showers": "ac_unit",
  Clear: "light_mode",
  Night: "nights_stay",
};

function getWeatherIcon(condition) {
  for (const [key, value] of Object.entries(weatherIconMap)) {
    if (condition.includes(key) || key.includes(condition.split(" ")[0])) {
      return value;
    }
  }
  return "light_mode";
}

function formatDate(dateString) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function getDayName(dateString) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(dateString).getDay()];
}

function updateMapSection(location, latitude, longitude) {
  const mapLocationName = document.getElementById("mapLocationName");
  const mapCoordinates = document.getElementById("mapCoordinates");

  mapLocationName.textContent = location;
  mapCoordinates.textContent = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;

  const mapIframe = document.getElementById("windyMap");
  if (mapIframe) {
    const mapUrl = `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&zoom=8&level=surface&overlay=radar`;
    mapIframe.src = mapUrl;
  }
}

function fetchWeather(location) {
  const url = `${apiUrl}?key=${apiKey}&q=${location}&aqi=yes`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      lastSearchedLocation = data.location.name + ", " + data.location.country;
      updateWeatherUI(data);
      fetchForecast(location);
      localStorage.setItem(
        "lastLocation",
        data.location.name + ", " + data.location.country,
      );
    })
    .catch((error) => {
      console.error("Erro ao buscar dados de clima:", error);
      alert("Erro ao buscar dados da cidade. Tente novamente.");
    });
}

function updateWeatherUI(data) {
  const location = data.location;
  const current = data.current;

  const tempC = current.temp_c;
  const tempF = current.temp_f;
  const feelsC = current.feelslike_c;
  const feelsF = current.feelslike_f;
  const windKph = current.wind_kph;
  const windMph = current.wind_mph;

  currentLocationData = {
    name: location.name,
    country: location.country,
    temperature: isImperial() ? Math.round(tempF) : Math.round(tempC),
    temp_c: tempC,
    temp_f: tempF,
    condition: current.condition.text,
  };

  mainLocation.textContent = `${location.name}, ${location.country}`;
  currentLocationDisplay.textContent = `${location.name}, ${location.country}`;

  updateMapSection(
    `${location.name}, ${location.country}`,
    location.lat,
    location.lon,
  );

  const today = new Date();
  currentDateElement.textContent = formatDate(today);

  temperatureElement.textContent = tempDisplay(tempC, tempF);
  descriptionElement.textContent = current.condition.text;
  humidityElement.textContent = `${current.humidity}%`;
  windElement.textContent = windDisplay(windKph, windMph);
  pressureElement.textContent = `${current.pressure_mb} hPa`;
  feelsLikeElement.textContent = `Feels like ${isImperial() ? Math.round(feelsF) + "°F" : Math.round(feelsC) + "°C"}`;

  const iconName = getWeatherIcon(current.condition.text);
  weatherIconElement.textContent = iconName;

  if (current.is_day === 1) {
    weatherIconElement.classList.remove("text-slate-400");
    weatherIconElement.classList.add("text-yellow-500");
  } else {
    weatherIconElement.classList.remove("text-yellow-500");
    weatherIconElement.classList.add("text-slate-400");
  }

  if (current.uv) {
    let uvLevel = "Low";
    if (current.uv > 6) uvLevel = "High";
    else if (current.uv > 3) uvLevel = "Moderate";
    uvElement.textContent = `${Math.round(current.uv)} (${uvLevel})`;
  }

  updateRecommendations(current.condition.text, isImperial() ? tempF : tempC);
  updateSaveButtonState();
}

function fetchForecast(location) {
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
  )
    .then((response) => response.json())
    .then(async (geoData) => {
      if (!geoData || geoData.length === 0) {
        throw new Error("Localização não encontrada");
      }
      const lat = geoData[0].lat;
      const lon = geoData[0].lon;
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=6&timezone=America%2FSao_Paulo`,
      );
      return await response.json();
    })
    .then((data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const days = [];
      for (let i = 0; i < data.daily.time.length; i++) {
        days.push({
          date: data.daily.time[i],
          day: {
            maxtemp_c: data.daily.temperature_2m_max[i],
            mintemp_c: data.daily.temperature_2m_min[i],
            condition: {
              text: getOpenMeteoCondition(data.daily.weathercode[i]),
              code: data.daily.weathercode[i],
            },
          },
        });
      }
      updateForecast(days);
    })
    .catch((error) => {
      console.error("Erro ao buscar previsão:", error);
      forecastContainer.innerHTML =
        '<div class="p-4 text-center text-app-muted">Não foi possível obter a previsão.</div>';
    });
}

function getOpenMeteoCondition(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return map[code] || "Unknown";
}

let selectedForecastIdx = null;
function updateForecast(forecastDays) {
  forecastContainer.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (selectedForecastIdx === null) {
    selectedForecastIdx = forecastDays.findIndex((day) => {
      const date = new Date(day.date);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });
    if (selectedForecastIdx === -1) selectedForecastIdx = 0;
  }

  forecastDays.forEach((day, idx) => {
    const date = new Date(day.date);
    date.setHours(0, 0, 0, 0);
    let label = getDayName(day.date);
    let highlightClass = "";
    if (idx === selectedForecastIdx) {
      highlightClass =
        "ring-2 ring-app-accent ring-offset-2 ring-offset-white dark:ring-offset-slate-900";
    } else if (date.getTime() === yesterday.getTime()) {
      label = "Yesterday";
      highlightClass = "border-app-accent/30 dark:border-app-accent/30";
    }
    if (date.getTime() === today.getTime()) {
      label = "Today";
    }

    const highC = day.day.maxtemp_c;
    const lowC = day.day.mintemp_c;
    const highF = (highC * 9) / 5 + 32;
    const lowF = (lowC * 9) / 5 + 32;
    const high = isImperial() ? highF : highC;
    const low = isImperial() ? lowF : lowC;
    const condition = day.day.condition.text;
    const iconName = getOpenMeteoIcon(day.day.condition.code);

    function getOpenMeteoIcon(code) {
      const map = {
        0: "light_mode",
        1: "wb_sunny",
        2: "wb_sunny",
        3: "cloud",
        45: "foggy",
        48: "foggy",
        51: "grain",
        53: "grain",
        55: "grain",
        56: "grain",
        57: "grain",
        61: "rainy",
        63: "rainy",
        65: "rainy",
        66: "rainy",
        67: "rainy",
        71: "ac_unit",
        73: "ac_unit",
        75: "ac_unit",
        77: "ac_unit",
        80: "rainy",
        81: "rainy",
        82: "rainy",
        85: "ac_unit",
        86: "ac_unit",
        95: "thunderstorm",
        96: "thunderstorm",
        99: "thunderstorm",
      };
      return map[code] || "light_mode";
    }

    const forecastCard = document.createElement("button");
    forecastCard.type = "button";
    forecastCard.className = `bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-center flex flex-col items-center justify-center group hover:border-app-accent/50 dark:hover:border-app-accent/50 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-app-accent/20 transition-all cursor-pointer h-40 min-w-[120px] ${highlightClass}`;

    if (date.getTime() === yesterday.getTime()) {
      forecastCard.style.backgroundColor =
        "color-mix(in srgb, var(--color-primary), transparent 90%)";
    }

    forecastCard.innerHTML = `
      <p class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">${label}</p>
      <span class="material-symbols-outlined text-5xl mb-3 text-app-accent" style="font-variation-settings: 'FILL' 1">${iconName}</span>
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xl font-bold text-slate-900 dark:text-white">${Math.round(high)}${isImperial() ? "°F" : "°C"}</span>
        <span class="text-sm text-slate-500 dark:text-slate-400">${Math.round(low)}${isImperial() ? "°F" : "°C"}</span>
      </div>
      <p class="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-2">${condition}</p>
    `;

    forecastCard.addEventListener("click", () => {
      selectedForecastIdx = idx;
      updateWeatherPanelFromForecast(
        day,
        label,
        iconName,
        Math.round(high),
        Math.round(low),
        condition,
      );
      updateForecast(forecastDays);
    });

    forecastContainer.appendChild(forecastCard);
  });
}

function updateWeatherPanelFromForecast(
  day,
  label,
  iconName,
  high,
  low,
  condition,
) {
  const temperatureElement = document.getElementById("temperature");
  const descriptionElement = document.getElementById("description");
  const weatherIconElement = document.getElementById("weatherIcon");

  temperatureElement.textContent = `${high}${isImperial() ? "°F" : "°C"}`;
  descriptionElement.textContent = condition;
  weatherIconElement.textContent = iconName;

  const currentDateElement = document.getElementById("currentDate");
  currentDateElement.textContent = formatDate(day.date);
  updateRecommendations(condition, high);
}

function saveCurrentLocation() {
  if (!currentLocationData) return;

  const savedLocations = loadSavedLocations();
  const locationName = `${currentLocationData.name}, ${currentLocationData.country}`;

  const exists = savedLocations.some((loc) => loc.name === locationName);
  if (exists) {
    alert(`${locationName} já está salvo!`);
    return;
  }

  savedLocations.push({
    name: locationName,
    temperature: currentLocationData.temperature,
    temp_c: currentLocationData.temp_c,
    temp_f: currentLocationData.temp_f,
    condition: currentLocationData.condition,
  });

  localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
  renderSavedLocations();
  alert(`${locationName} foi salvo com sucesso!`);
}

function updateSaveButtonState() {
  const savedLocations = loadSavedLocations();
  const locationName = `${currentLocationData.name}, ${currentLocationData.country}`;
  const isSaved = savedLocations.some((loc) => loc.name === locationName);

  if (isSaved) {
    saveLocationBtn.classList.add("border-app-accent/50");
    saveLocationBtn.style.backgroundColor =
      "color-mix(in srgb, var(--color-primary), transparent 85%)";
    saveLocationBtn
      .querySelector(".material-symbols-outlined")
      .classList.add("text-app-accent");
  } else {
    saveLocationBtn.classList.remove("border-app-accent/50");
    saveLocationBtn.style.backgroundColor = "";
    saveLocationBtn
      .querySelector(".material-symbols-outlined")
      .classList.remove("text-app-accent");
  }
}

function renderSavedLocations() {
  const savedLocations = loadSavedLocations();
  savedLocationsContainer.innerHTML = "";

  savedLocations.forEach((location) => {
    let displayTemp = location.temperature;
    if (location.temp_c !== undefined && location.temp_f !== undefined) {
      displayTemp = isImperial()
        ? Math.round(location.temp_f)
        : Math.round(location.temp_c);
    }

    const button = document.createElement("button");
    button.className =
      "w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors text-left";
    button.innerHTML = `
      <span class="flex items-center gap-2 min-w-0">
        <span class="material-symbols-outlined text-xs text-app-accent">location_on</span>
        <span class="truncate text-slate-700 dark:text-slate-100">${location.name}</span>
      </span>
      <span class="font-semibold text-slate-900 dark:text-slate-100 ml-2">${displayTemp}°</span>
    `;

    button.addEventListener("click", () => {
      fetchWeather(location.name.split(",")[0]);
    });

    savedLocationsContainer.appendChild(button);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchWeather(lastSearchedLocation);
  renderSavedLocations();
  window.addEventListener("storage", (e) => {
    if (e.key === "weatherDashUnit") {
      fetchWeather(lastSearchedLocation);
      updateForecast(fullForecastData || []);
      renderSavedLocations();
    }
  });
});

locationInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const location = locationInput.value.trim();
    if (location) {
      fetchWeather(location);
      locationInput.value = "";
      suggestionsContainer.classList.add("hidden");
    }
  }
});

locationInput.addEventListener("input", function (event) {
  const query = event.target.value.trim();

  if (suggestionsTimeout) {
    clearTimeout(suggestionsTimeout);
  }

  if (query.length === 0) {
    suggestionsContainer.classList.add("hidden");
    return;
  }

  suggestionsTimeout = setTimeout(() => {
    fetchLocationSuggestions(query);
  }, 300);
});

function fetchLocationSuggestions(query) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=no`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const searchUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`;
      return fetch(searchUrl).then((res) => res.json());
    })
    .then((data) => {
      renderSuggestions(data);
    })
    .catch((error) => {
      console.error("Erro ao buscar sugestões:", error);
      suggestionsContainer.innerHTML =
        '<div class="px-4 py-3 text-sm text-app-muted">Nenhuma sugestão encontrada</div>';
      suggestionsContainer.classList.remove("hidden");
    });
}

function renderSuggestions(data) {
  suggestionsContainer.innerHTML = "";

  if (!data || data.length === 0) {
    suggestionsContainer.innerHTML =
      '<div class="px-4 py-3 text-sm text-app-muted">Nenhuma cidade encontrada</div>';
    suggestionsContainer.classList.remove("hidden");
    return;
  }

  data.slice(0, 8).forEach((location) => {
    const suggestion = document.createElement("button");
    suggestion.type = "button";
    suggestion.className =
      "w-full px-4 py-3 text-left hover:bg-app-tertiary transition-colors flex items-center gap-3 border-b border-app-border last:border-b-0";

    const cityName = location.name;
    const regionName = location.region ? location.region : "";
    const countryName = location.country;

    let displayText = cityName;
    if (regionName && regionName !== cityName) {
      displayText += `, ${regionName}`;
    }
    displayText += `, ${countryName}`;

    suggestion.innerHTML = `
      <span class="material-symbols-outlined text-app-muted text-sm">location_on</span>
      <div class="flex-1">
        <p class="text-sm font-medium text-app-text">${cityName}</p>
        <p class="text-xs text-app-muted">${regionName ? regionName + ", " : ""}${countryName}</p>
      </div>
    `;

    suggestion.addEventListener("click", () => {
      locationInput.value = "";
      suggestionsContainer.classList.add("hidden");
      fetchWeather(cityName);
    });

    suggestionsContainer.appendChild(suggestion);
  });

  suggestionsContainer.classList.remove("hidden");
}

document.addEventListener("click", (e) => {
  if (e.target !== locationInput && !suggestionsContainer.contains(e.target)) {
    suggestionsContainer.classList.add("hidden");
  }
});

refreshBtn.addEventListener("click", () => {
  const icon = refreshBtn.querySelector(".material-symbols-outlined");
  icon.style.animation = "spin 0.6s linear";

  setTimeout(() => {
    icon.style.animation = "none";
  }, 600);

  fetchWeather(lastSearchedLocation);
});

saveLocationBtn.addEventListener("click", () => {
  saveCurrentLocation();
});

shareBtn.addEventListener("click", async () => {
  const weatherPanel = document.getElementById("weatherPanel");

  try {
    const originalText = shareBtn.querySelector(
      ".material-symbols-outlined",
    ).textContent;
    shareBtn.querySelector(".material-symbols-outlined").textContent =
      "check_circle";
    shareBtn.classList.add("bg-green-100", "border-green-300");

    const canvas = await html2canvas(weatherPanel, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    canvas.toBlob(async (blob) => {
      try {
        if (
          navigator.share &&
          navigator.canShare({
            files: [new File([blob], "clima.png", { type: "image/png" })],
          })
        ) {
          await navigator.share({
            files: [new File([blob], "clima.png", { type: "image/png" })],
            title: "Previsão do Clima",
            text: `Veja como está o clima em ${currentLocationData.name}!`,
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `clima-${currentLocationData.name.replace(/\s+/g, "-")}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Erro ao compartilhar:", error);
        alert("Erro ao compartilhar. Verifique o console para detalhes.");
      }

      setTimeout(() => {
        shareBtn.querySelector(".material-symbols-outlined").textContent =
          originalText;
        shareBtn.classList.remove("bg-green-100", "border-green-300");
      }, 2000);
    });
  } catch (error) {
    console.error("Erro ao capturar imagem:", error);
    alert("Erro ao capturar screenshot. Tente novamente.");

    shareBtn.querySelector(".material-symbols-outlined").textContent = "share";
    shareBtn.classList.remove("bg-green-100", "border-green-300");
  }
});

function updateRecommendations(condition, temp) {
  const container = document.getElementById("recommendationsContainer");
  if (!container) return;
  container.innerHTML = "";

  loadRecommendationsData().then((data) => {
    let category = "Default";
    const lowerCondition = condition.toLowerCase();

    if (
      lowerCondition.includes("rain") ||
      lowerCondition.includes("drizzle") ||
      lowerCondition.includes("shower")
    )
      category = "Rain";
    else if (
      lowerCondition.includes("snow") ||
      lowerCondition.includes("blizzard") ||
      lowerCondition.includes("sleet") ||
      lowerCondition.includes("ice")
    )
      category = "Snow";
    else if (lowerCondition.includes("thunder")) category = "Thunderstorm";
    else if (lowerCondition.includes("fog") || lowerCondition.includes("mist"))
      category = "Fog";
    else if (
      lowerCondition.includes("clear") ||
      lowerCondition.includes("sunny")
    )
      category = "Clear";
    else if (temp >= 30) category = "Hot";
    else if (temp <= 10) category = "Cold";

    let items =
      data && data[category]
        ? data[category]
        : data && data["Default"]
          ? data["Default"]
          : [];
    items = [...items];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    items.slice(0, 3).forEach((item) => {
      const color = item.color || "emerald";
      const div = document.createElement("div");
      div.className = `p-4 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg border-l-4 border-${color}-400 dark:border-${color}-600`;
      div.innerHTML = `
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-${color}-600 dark:text-${color}-400">${item.icon}</span>
            <div>
              <p class="font-bold text-sm text-slate-900 dark:text-slate-100">${item.text}</p>
            </div>
          </div>
        `;
      container.appendChild(div);
    });
  });
}
