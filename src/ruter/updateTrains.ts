import axios from 'axios';
import Moment from 'moment';
import { TrainData, TrainDataSet, RuterApiData } from '../types/trains';

// Fetch train data, parse it, and return a train data set
async function getRuterData(station: string, direction: string): Promise<TrainDataSet> {
  const trains: TrainDataSet = {};

  try {
    const url = `https://reisapi.ruter.no/StopVisit/GetDepartures/${station}?json=true`;
    const result = await axios.get(url);
    const jsonData = result.data;

    if (result.status !== 200) throw Error('Couldnt fetch ruter data');

    jsonData.forEach((t: RuterApiData) => {
      if (t.MonitoredVehicleJourney.MonitoredCall.DeparturePlatformName === direction) {
        const d = t.MonitoredVehicleJourney.MonitoredCall;
        const out: TrainData = {
          ruteTid: Moment(d.AimedArrivalTime),
          faktiskTid: Moment(d.ExpectedArrivalTime),
          id: `${t.MonitoredVehicleJourney.FramedVehicleJourneyRef.DataFrameRef}_${t.MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef}`,
          linje: t.MonitoredVehicleJourney.PublishedLineName,
          skalTil: t.MonitoredVehicleJourney.DestinationName,
        };
        trains[out.id] = out;
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
  return trains;
}

// Just wrapping the thing below.
export default async function getTrains(station: string, direction: string): Promise<TrainDataSet> {
  const trainData = await getRuterData(station, direction);
  return trainData;
}
