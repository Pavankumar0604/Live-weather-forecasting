import React from "react";
import apiKeys from "./apiKeys";
// import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

// Date formatting utility
const dateBuilder = (d) => {
  let months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  let days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();
  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

class Weather extends React.Component {
  state = {
    lat: undefined,
    lon: undefined,
    errorMessage: undefined,
    temperatureC: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: "CLEAR_DAY",
    sunrise: undefined,
    sunset: undefined,
    main: "",
  };

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Successfully retrieved location
          this.setState({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            errorMessage: undefined,
          });
          this.getWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // Error or denied permission: fallback to default location (Delhi)
          this.setState({
            lat: 28.67,
            lon: 77.22,
            errorMessage: error.message,
          });
          this.getWeather(28.67, 77.22);
          alert(
            "You have disabled location service. Default location will be used for calculating weather."
          );
        }
      );
    } else {
      // Geolocation not available
      this.setState({
        errorMessage: "Geolocation is not available in your browser.",
        lat: 28.67,
        lon: 77.22,
      });
      this.getWeather(28.67, 77.22);
      alert("Geolocation not available");
    }

    // Refresh weather every 10min
    this.timerID = setInterval(() => {
      const {lat, lon} = this.state;
      if (lat && lon) {
        this.getWeather(lat, lon);
      }
    }, 600000); // 10min
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  getWeather = async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();

      if (data?.main?.temp !== undefined) {
        this.setState({
          temperatureC: Math.round(data.main.temp),
          city: data.name,
          country: data.sys.country,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          main: data.weather[0].main,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          // icon logic could be modified here
        });
      } else {
        this.setState({ errorMessage: "Failed to fetch weather data." });
      }
    } catch (err) {
      this.setState({ errorMessage: "Failed to fetch weather data." });
    }
  };

  render() {
    const {temperatureC, city, country, main, errorMessage} = this.state;
    if (temperatureC) {
      return (
        <div>
          <h2>
            {city}, {country}
          </h2>
          <div>{main}</div>
          <div>{dateBuilder(new Date())}</div>
          <div>{temperatureC}°C</div>
        </div>
      );
    } else {
      return (
        <div>
          <p>Detecting your location...</p>
          <p>
            Your current location will be used for calculating real time weather.
          </p>
          {errorMessage && <p>Error: {errorMessage}</p>}
        </div>
      );
    }
  }
}

export default Weather;
