// Função auxiliar para gerar 24 horas de previsão para um dia específico
const generateHours = (date: string) => {
  return Array.from({ length: 24 }).map((_, index) => {
    const hourString = index.toString().padStart(2, '0');
    return {
      time_epoch: new Date(`${date}T${hourString}:00:00Z`).getTime() / 1000,
      time: `${date} ${hourString}:00`,
      temp_c: 20 + Math.sin(index / 24 * Math.PI) * 10, // Variação de temperatura simulada
      temp_f: (20 + Math.sin(index / 24 * Math.PI) * 10) * 1.8 + 32,
      is_day: index >= 6 && index <= 18 ? 1 : 0,
      condition: {
        text: index >= 6 && index <= 18 ? "Sunny" : "Clear",
        icon: index >= 6 && index <= 18 ? "//cdn.weatherapi.com/weather/64x64/day/113.png" : "//cdn.weatherapi.com/weather/64x64/night/113.png",
        code: 1000
      },
      wind_mph: 6.2,
      wind_kph: 10.0,
      wind_degree: 180,
      wind_dir: "S",
      pressure_mb: 1012.0,
      pressure_in: 29.88,
      precip_mm: 0.0,
      precip_in: 0.0,
      humidity: 50 + Math.random() * 20,
      cloud: 10,
      feelslike_c: 22.0,
      feelslike_f: 71.6,
      windchill_c: 20.0,
      windchill_f: 68.0,
      heatindex_c: 22.0,
      heatindex_f: 71.6,
      dewpoint_c: 12.0,
      dewpoint_f: 53.6,
      will_it_rain: 0,
      chance_of_rain: 0,
      will_it_snow: 0,
      chance_of_snow: 0,
      vis_km: 10.0,
      vis_miles: 6.0,
      gust_mph: 8.0,
      gust_kph: 12.9,
      uv: index >= 6 && index <= 18 ? 5.0 : 0.0
    };
  });
};

export const forecastFixture = {
  location: {
    name: "Sao Paulo",
    region: "Sao Paulo",
    country: "Brazil",
    lat: -23.53,
    lon: -46.62,
    tz_id: "America/Sao_Paulo",
    localtime_epoch: 1715562000,
    localtime: "2026-05-12 21:00"
  },
  current: {
    last_updated_epoch: 1715562000,
    last_updated: "2026-05-12 21:00",
    temp_c: 25.0,
    temp_f: 77.0,
    is_day: 0,
    condition: {
      text: "Clear",
      icon: "//cdn.weatherapi.com/weather/64x64/night/113.png",
      code: 1000
    },
    wind_mph: 6.5,
    wind_kph: 10.5,
    wind_degree: 140,
    wind_dir: "SE",
    pressure_mb: 1016.0,
    pressure_in: 30.0,
    precip_mm: 0.0,
    precip_in: 0.0,
    humidity: 60,
    cloud: 0,
    feelslike_c: 26.0,
    feelslike_f: 78.8,
    vis_km: 10.0,
    vis_miles: 6.0,
    uv: 1.0,
    gust_mph: 10.0,
    gust_kph: 16.1
  },
  forecast: {
    forecastday: [
      {
        date: "2026-05-12",
        date_epoch: 1715472000,
        day: {
          maxtemp_c: 28.0,
          maxtemp_f: 82.4,
          mintemp_c: 18.0,
          mintemp_f: 64.4,
          avgtemp_c: 23.0,
          avgtemp_f: 73.4,
          maxwind_mph: 9.3,
          maxwind_kph: 15.0,
          totalprecip_mm: 0.0,
          totalprecip_in: 0.0,
          totalsnow_cm: 0.0,
          avgvis_km: 10.0,
          avgvis_miles: 6.0,
          avghumidity: 60,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 0,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: { text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png", code: 1000 },
          uv: 8.0
        },
        astro: {
          sunrise: "06:00 AM",
          sunset: "06:00 PM",
          moonrise: "07:00 PM",
          moonset: "05:00 AM",
          moon_phase: "Waning Crescent",
          moon_illumination: 20,
          is_moon_up: 1,
          is_sun_up: 0
        },
        hour: generateHours("2026-05-12")
      },
      {
        date: "2026-05-13",
        date_epoch: 1715558400,
        day: {
          maxtemp_c: 29.0,
          maxtemp_f: 84.2,
          mintemp_c: 19.0,
          mintemp_f: 66.2,
          avgtemp_c: 24.0,
          avgtemp_f: 75.2,
          maxwind_mph: 10.0,
          maxwind_kph: 16.0,
          totalprecip_mm: 0.0,
          totalprecip_in: 0.0,
          totalsnow_cm: 0.0,
          avgvis_km: 10.0,
          avgvis_miles: 6.0,
          avghumidity: 55,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 0,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png", code: 1003 },
          uv: 8.0
        },
        astro: {
          sunrise: "06:01 AM",
          sunset: "05:59 PM",
          moonrise: "08:00 PM",
          moonset: "06:00 AM",
          moon_phase: "Waning Crescent",
          moon_illumination: 10,
          is_moon_up: 1,
          is_sun_up: 0
        },
        hour: generateHours("2026-05-13")
      },
      {
        date: "2026-05-14",
        date_epoch: 1715644800,
        day: {
          maxtemp_c: 27.0,
          maxtemp_f: 80.6,
          mintemp_c: 17.0,
          mintemp_f: 62.6,
          avgtemp_c: 22.0,
          avgtemp_f: 71.6,
          maxwind_mph: 12.4,
          maxwind_kph: 20.0,
          totalprecip_mm: 10.0,
          totalprecip_in: 0.39,
          totalsnow_cm: 0.0,
          avgvis_km: 8.0,
          avgvis_miles: 5.0,
          avghumidity: 75,
          daily_will_it_rain: 1,
          daily_chance_of_rain: 80,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/308.png", code: 1195 },
          uv: 5.0
        },
        astro: {
          sunrise: "06:02 AM",
          sunset: "05:58 PM",
          moonrise: "09:00 PM",
          moonset: "07:00 AM",
          moon_phase: "New Moon",
          moon_illumination: 0,
          is_moon_up: 1,
          is_sun_up: 0
        },
        hour: generateHours("2026-05-14")
      }
    ]
  }
};
