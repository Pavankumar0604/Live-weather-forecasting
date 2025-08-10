import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = "8b8ea9a4ee0d96497905b60fbe99f4f4";

function App() {
  const [weather, setWeather] = useState({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  // Get weather by latitude/longitude
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(formatWeather(data));
        setError("");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to fetch weather.");
    }
  };

  // Get weather by city name
  const fetchWeatherByCity = async (city) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(formatWeather(data));
        setError("");
      } else {
        setError("City not found");
      }
    } catch {
      setError("Failed to fetch weather.");
    }
  };

  // Format API data
  const formatWeather = (data) => {
    return {
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      desc: data.weather[0].description,
      humidity: data.main.humidity,
      wind: `${data.wind.speed} m/s`,
      date: new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  // Auto fetch on mount using geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // fallback to default city if denied
          fetchWeatherByCity("Bengaluru");
        }
      );
    } else {
      fetchWeatherByCity("Bengaluru");
    }
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setWeather((prev) => prev.city ? { ...prev, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) } : prev);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeatherByCity(query.trim());
      setQuery("");
    }
  };

  return (
    <div className="app-bg">
      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter city name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-bar"
        />
        <button type="submit" className="search-btn">Search</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {weather.city && (
        <div className="weather-card">
          <div className="weather-card__header">
            <h2>{weather.city}, {weather.country}</h2>
            <div className="weather-card__meta">
              <span>{weather.date}</span>
              <span>{weather.time}</span>
            </div>
          </div>
          <div className="weather-card__icon">
            {/* Replace with dynamic icon */}
            🌤
          </div>
          <div className="weather-card__temp">{weather.temp}°C</div>
          <div className="weather-card__desc">{weather.desc}</div>
          <div className="weather-card__details">
            <div>
              <span className="weather-card__label">Humidity</span>
              <span className="weather-card__value">{weather.humidity}%</span>
            </div>
            <div>
              <span className="weather-card__label">Wind</span>
              <span className="weather-card__value">{weather.wind}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
