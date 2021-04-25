import { WeatherApiTimesetData } from '../types/yr';
import { parsedWind } from '../types/forecast';

/**
0-1	0	Stille	 	Røyken stiger rett opp
1-3	1	Flau vind	 	En kan se vindretningen av røykens drift
4-6	2	Svak vind	2	En kan føle vinden. Bladene på trærne rører seg, vinden kan løfte små vimpler.
7-10	3	Lett bris	5	Løv og småkvister rører seg. Vinden strekker lette flagg og vimpler
11-16	4	Laber bris	7	Vinden løfter støv og løse papirer, rører på kvister og smågreine, strekker større flagg og vimpler
17-21	5	Frisk bris	10	Småtrær med løv begynner å svaie. På vann begynner småbølgene å toppe seg
22-27	6	Liten Kuling	12	Store greiner og mindre stammer rører seg. Det hviner i telefonledninger. Det er vanskelig å bruke paraply. En merker motstand når en går.
28-33	7	Stiv kuling	15	Hele trær rører på seg. Det er tungt å gå mot vinden.
34-40	8	Sterk kuling	20	Vinden brekker kvister av trærne. Det er tungt å gå mot vinden.
41-47	9	Liten storm	22	Hele store trær svaier og hiver. Takstein kan blåse ned.
48-55	10	Full storm	25	Sjelden inne i landet. Trær rykkes opp med rot. Stor skade på hus.
56-62	11	Sterk storm	30	Forekommer sjelden og følges av store ødeleggelser.
63-	12	Orkan	33-	
Forekommer meget sjelden. Uvanlig store ødeleggelser
**/

export default function mapWindToSomethingUsable(data: WeatherApiTimesetData): parsedWind {
  return {
    wind: data.instant.details.wind_speed,
    gust: data.instant.details.wind_speed_of_gust,
    windName: mapWind(data.instant.details.wind_speed),
    gustName: mapWind(data.instant.details.wind_speed_of_gust),
    direction: data.instant.details.wind_from_direction,
  };
}

function mapWind(windSpeed: number): string {
  if (windSpeed >= 33) {
    return 'orkan';
  } else if (windSpeed >= 30) {
    return 'sterk storm';
  } else if (windSpeed >= 25) {
    return 'full storm';
  } else if (windSpeed >= 22) {
    return 'liten storm';
  } else if (windSpeed >= 20) {
    return 'sterk kuling';
  } else if (windSpeed >= 15) {
    return 'stiv kuling';
  } else if (windSpeed >= 12) {
    return 'liten kuling';
  } else if (windSpeed >= 10) {
    return 'frisk bris';
  } else if (windSpeed >= 7) {
    return 'laber bris';
  } else if (windSpeed >= 5) {
    return 'lett bris';
  } else if (windSpeed >= 5) {
    return 'svak vind';
  }

  return '';
}
