import dayjs, { Dayjs } from "dayjs";
import dotenv from "dotenv";
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}
// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: Dayjs | string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;

  constructor(
    city: string,
    date: Dayjs | string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    iconDescription: string
  ) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private city = "";
  constructor() {
    this.baseURL = process.env.API_BASE_URL || "";
    this.apiKey = process.env.API_KEY || "";
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);

      const cityLocation = await response.json();

      return cityLocation;
    } catch (err) {
      console.log("Error:", err);
      return err;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates[]): Coordinates {
    const data = locationData[0];
    const { name, lat, lon, country, state } = data;
    return {
      name,
      lat,
      lon,
      country,
      state,
    };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const geoCode = `${this.baseURL}/geo/1.0/direct?q=${this.city}&appid=${this.apiKey}`;
    return geoCode;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates) {
    const weatherQuery = `${this.baseURL}/data/2.5/forecast?units=imperial&lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
    return weatherQuery;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    const unstructuredData = this.destructureLocationData(locationData);

    return unstructuredData;
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(weatherQuery: string) {
    try {
      const response = await fetch(weatherQuery);
      const data = await response.json();
      const CurrentWeather = this.parseCurrentWeather(data);
      console.log(`${JSON.stringify(CurrentWeather)} hi`);
      const futureWeather = data.list;
      const forecast = this.buildForecastArray(CurrentWeather, futureWeather);
      console.log(`${JSON.stringify(forecast)} hi`);
      return forecast;
    } catch (err) {
      console.log("Error:", err);
      return err;
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const date = dayjs.unix(response.list[0].dt).format("M/D/YYYY");
    const newWeather = new Weather(
      response.city.name,
      date,
      response.list[0].main.temp,
      response.list[0].wind.speed,
      response.list[0].main.humidity,
      response.list[0].weather[0].main,
      response.list[0].weather[0].description
    );
    return newWeather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(_currentWeather: Weather, weatherData: any[]) {
    const forecastArray = [];
    for (const weather of weatherData) {
      const date = dayjs.unix(weather.dt).format("M/D/YYYY");
      const forecast = new Weather(
        this.city,
        date,
        weather.main.temp,
        weather.wind.speed,
        weather.main.humidity,
        weather.weather[0].main,
        weather.weather[0].description
      );
      forecastArray.push(forecast);
    }

    const everyEigth = forecastArray.filter((_, index) => index === 0 || (index + 1) % 8 === 0);
    return everyEigth;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.city = city;
    const locationData = await this.fetchAndDestructureLocationData();
    const weatherQuery = this.buildWeatherQuery(locationData);
    const forecast = await this.fetchWeatherData(weatherQuery);
    return forecast;
  }
}

export default new WeatherService();

// https://api.openweathermap.org/geo/1.0/direct?q=midland&appid=07c96437fd25aa46cd2f1a1a0b1c6aba
// https://api.openweathermap.org/data/2.5/forecast?lat=31.99&lon=-102.07&appid=07c96437fd25aa46cd2f1a1a0b1c6aba
