import createEnturService from '@entur/sdk';
import Moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { TrainData, TrainDataSet } from '../types/trains';

// Create link with unique requestor ID
const fetchId = uuidv4();
const ENTUR_URL = `https://api.entur.io/realtime/v1/rest/et?datasetId=RUT&requestorId=${fetchId}`;
const THE_STOP = 'NSR:Quay:11460';

// const VINDEREN = 'NSR:StopPlace:58270';
const VINDEREN_T = 'NSR:StopPlace:6245';
const VINDEREN_B = 'NSR:StopPlace:6248';
const VINDEREN_T_SPOR = '2';
const VINDEREN_B_DESTINATION = 'Majorstuen';

// const SLEMDAL_BUS = 'NSR:StopPlace:58270';
// const SLEMDAL_BANE = 'NSR:StopPlace:58270';

// Fetch Entur API data
export default async function getTrains(): Promise<TrainDataSet> {
  const trains: TrainDataSet = {};
  try {
    // New
    const entur = createEnturService({ clientName: 'kvasbo-infoskjerm' });

    const trips = await entur.getDeparturesFromStopPlaces([VINDEREN_T, VINDEREN_B]);

    trips?.forEach((t) => {
      t?.departures.forEach((d) => {
        // Bane
        if (
          d.forBoarding &&
          d.quay?.stopPlace.id === VINDEREN_T &&
          d.quay?.publicCode === VINDEREN_T_SPOR
        ) {
          const out: TrainData = {
            ruteTid: Moment(d.aimedArrivalTime),
            faktiskTid: Moment(d.expectedArrivalTime),
            id: d.serviceJourney.id,
            linje: '1',
            skalTil: d.destinationDisplay.frontText,
            type: 'Bane',
          };
          trains[out.id] = out;
        } else if (d.forBoarding && d.destinationDisplay.frontText === VINDEREN_B_DESTINATION) {
          const out: TrainData = {
            ruteTid: Moment(d.aimedArrivalTime),
            faktiskTid: Moment(d.expectedArrivalTime),
            id: d.serviceJourney.id,
            linje: '46',
            skalTil: d.destinationDisplay.frontText,
            type: 'Buss',
          };
          trains[out.id] = out;
        }
      });
    });

    const filteredData = [];

    return trains;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
  return trains;
}
