import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import sumBy from 'lodash/sumBy';
import { ForecastDataSet, HourForecast, WeatherDataSeries, WeatherLimits } from '../types/forecast';
import { YrWeatherSeries } from '../types/yr';

/*
New function to filter an Yr data series. Get only six hour forecasts, and filter by date
*/
export function getUsableYrDataset(
  data: YrWeatherSeries,
  fromStamp = 0,
  toStamp = 9999999999999,
): YrWeatherSeries {
  //  The time points to use for weather (all these needs to have six hour forecasts)
  const utcHoursToUse = [0, 6, 12, 18];

  // Then filter
  const out: YrWeatherSeries = {};
  for (const time in data) {
    const d = new Date(time);
    if (
      utcHoursToUse.indexOf(d.getUTCHours()) !== -1 &&
      data[time].data.next_6_hours &&
      d.valueOf() >= fromStamp &&
      d.valueOf() <= toStamp
    ) {
      out[time] = data[time];
    }
  }
  return out;
}

/**
Transform a Yr series to a Tellulf series that can be parsed by the graph
*/
export function parseYrDatasetToTellulf(data: YrWeatherSeries): WeatherDataSeries {
  const out: WeatherDataSeries = {};
  for (const time in data) {
    const d = new Date(time);
    const stamp = d.valueOf();
    const fc: HourForecast = {
      time: stamp,
      durationInHours: 6,
      temp: Math.round(data[time].data.instant.details.air_temperature),
      rain: data[time].data.next_6_hours.details.precipitation_amount / 10,
      rainMin: data[time].data.next_6_hours.details.precipitation_amount_min / 10,
      rainMax: data[time].data.next_6_hours.details.precipitation_amount_max / 10,
      symbol: data[time].data.next_6_hours.summary.symbol_code,
    };
    out[stamp] = fc;
  }

  return out;
}

export function createForecastSummary(data: WeatherDataSeries): string {
  const weather = Object.values(data);

  if (weather.length === 0) return '';
  const maxTemp = maxBy(weather, (w: HourForecast): number => {
    return w.temp !== undefined ? w.temp : -999;
  });
  const minTemp = minBy(weather, (w: HourForecast): number => {
    return w.temp !== undefined ? w.temp : 999;
  });

  const rain = sumBy(weather, (w: HourForecast): number => {
    if (!w.rain) return 0;
    return w.rain * 10;
  });

  const maxT = maxTemp && maxTemp.temp !== undefined ? Math.round(maxTemp.temp) : '?';
  const minT = minTemp && minTemp.temp !== undefined ? Math.round(minTemp.temp) : '?';
  const r = Math.round(rain);

  if (!maxT || !minT) {
    // return '';
  }

  return `${minT}/${maxT} ${r}mm`;
}

// Calculate global limits
export function parseLimits(d: ForecastDataSet): WeatherLimits {
  // Merge the datasets
  const points: HourForecast[] = [];
  Object.values(d).forEach((s) => {
    Object.values(s.forecast).forEach((v: HourForecast) => {
      points.push(v);
    });
  });

  // Calculate the limits
  const maxTempPoint = maxBy(points, 'temp');
  const maxRainPoint = maxBy(points, 'rainMax');
  const minTempPoint = minBy(points, 'temp');

  const minTemp = minTempPoint && minTempPoint.temp ? minTempPoint.temp : 0;
  const maxTemp = maxTempPoint && maxTempPoint.temp ? maxTempPoint.temp : 0;
  const maxRain = maxRainPoint && maxRainPoint.rainMax ? maxRainPoint.rainMax : 0;

  const roundedMin = Math.floor((minTemp - 2) / 10) * 10;
  const roundedMax = Math.ceil((maxTemp + 2) / 10) * 10;

  const lowerRange = minTemp > 0 ? 0 : Math.min(0, roundedMin);
  const upperRange = Math.max(lowerRange + 30, roundedMax);

  const ticks: number[] = [];
  for (let i = lowerRange; i <= upperRange; i += 10) {
    ticks.push(i);
  }

  return {
    minTemp,
    maxTemp,
    maxRain,
    lowerRange,
    upperRange,
    ticks,
  };
}
