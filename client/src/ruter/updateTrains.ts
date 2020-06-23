import axios from 'axios';
import Moment from 'moment';
import XML from 'pixl-xml';
import {
  TrainData,
  TrainDataSet,
  EnturApiData,
  EnturTripData,
  EnturCallData,
} from '../types/trains';

// Create link with unique requestor ID
const ENTUR_URL = `https://api.entur.io/realtime/v1/rest/et?datasetId=RUT`;
const THE_STOP = 'NSR:Quay:11460';

// Fetch Entur API data
export default async function getTrains(): Promise<TrainDataSet> {
  const trains: TrainDataSet = {};
  try {
    const config = { headers: { 'ET-Client-Name': 'kvasbo - infoskjerm' } };
    const data = await axios.get(ENTUR_URL, config);
    if (data.status !== 200) throw Error('Couldnt fetch entur data');
    const parsed: EnturApiData = XML.parse(data.data);
    // Get the interesting data.
    const actualData =
      parsed.ServiceDelivery.EstimatedTimetableDelivery.EstimatedJourneyVersionFrame
        .EstimatedVehicleJourney;
    // Empty data set!
    if (!actualData || !actualData.filter) return trains;
    // Only the correct station and line
    const filteredData = actualData.filter((t: EnturTripData) => {
      return t.DirectionRef === '1' && t.LineRef === 'RUT:Line:1';
    });
    filteredData.forEach((t: EnturTripData) => {
      // Kill bad datas
      if (
        !t.EstimatedCalls ||
        !t.EstimatedCalls.EstimatedCall ||
        !t.EstimatedCalls.EstimatedCall.length // not an array!
      )
        return;
      t.EstimatedCalls.EstimatedCall.forEach((c: EnturCallData) => {
        if (c.StopPointRef && c.StopPointRef !== THE_STOP) return;
        const out: TrainData = {
          ruteTid: Moment(c.AimedArrivalTime),
          faktiskTid: Moment(c.ExpectedArrivalTime),
          id: `${t.FramedVehicleJourneyRef.DataFrameRef}_${t.FramedVehicleJourneyRef.DatedVehicleJourneyRef}`,
          linje: t.LineRef,
          skalTil: c.DestinationDisplay,
        };
        trains[out.id] = out;
      });
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
  return trains;
}
