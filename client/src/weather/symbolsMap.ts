// https://api.met.no/weatherapi/weathericon/2.0/documentation
// https://erikflowers.github.io/weather-icons/api-list.html

const yrBaseUrl = '/weather_symbols';
const mappedBaseUrl = '/weather_icons';

const doMap = false;

interface WeatherSymbolsMap {
  [s: string]: string;
}

const symbolsMap: WeatherSymbolsMap = {
  clearsky_day: 'day-sunny',
  clearsky_night: 'night-clear',
  fair_day: 'day-sunny-overcast',
  fair_night: 'night-cloudy',
  partlycloudy_day: 'day-cloudy',
  partlycloudy_night: 'night-cloudy',
  cloudy: 'cloud',
  lightrainshowers_day: 'day-showers',
  lightrainshowers_night: 'night-showers',
  lightrain: 'rain',
};

export function mapSymbol(symbol: string): string {
  if (doMap && symbolsMap[symbol]) {
    const file = `wi-${symbolsMap[symbol]}`;
    const newUrl = `${mappedBaseUrl}/${file}.svg`;
    return newUrl;
  } else {
    console.log(symbol);
  }

  return `${yrBaseUrl}/${symbol}.png`;
}

/**

clearsky	1	Clear sky	
cloudy	4	Cloudy	
fair	2	Fair	
fog	15	Fog	
heavyrain	10	Heavy rain	
heavyrainandthunder	11	Heavy rain and thunder	
heavyrainshowers	41	Heavy rain showers	
heavyrainshowersandthunder	25	Heavy rain showers and thunder	
heavysleet	48	Heavy sleet	
heavysleetandthunder	32	Heavy sleet and thunder	
heavysleetshowers	43	Heavy sleet showers	
heavysleetshowersandthunder	27	Heavy sleet showers and thunder	
heavysnow	50	Heavy snow	
heavysnowandthunder	34	Heavy snow and thunder	
heavysnowshowers	45	Heavy snow showers	
heavysnowshowersandthunder	29	Heavy snow showers and thunder	
lightrain	46	Light rain	
lightrainandthunder	30	Light rain and thunder	
lightrainshowers	40	Light rain showers	
lightrainshowersandthunder	24	Light rain showers and thunder	
lightsleet	47	Light sleet	
lightsleetandthunder	31	Light sleet and thunder	
lightsleetshowers	42	Light sleet showers	
lightsnow	49	Light snow	
lightsnowandthunder	33	Light snow and thunder	
lightsnowshowers	44	Light snow showers	
lightssleetshowersandthunder	26	Light sleet showers and thunder	
lightssnowshowersandthunder	28	Light snow showers and thunder	
partlycloudy	3	Partly cloudy	
rain	9	Rain	
rainandthunder	22	Rain and thunder	
rainshowers	5	Rain showers	
rainshowersandthunder	6	Rain showers and thunder	
sleet	12	Sleet	
sleetandthunder	23	Sleet and thunder	
sleetshowers	7	Sleet showers	
sleetshowersandthunder	20	Sleet showers and thunder	
snow	13	Snow	
snowandthunder	14	Snow and thunder	
snowshowers	8	Snow showers	
snowshowersandthunder	21	Snow showers and thunder	

*/
