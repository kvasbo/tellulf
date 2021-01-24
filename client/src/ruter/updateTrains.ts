import createEnturService from '@entur/sdk';
import Moment from 'moment';
import { TrainData, TrainDataSet } from '../types/trains';

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

    return trains;
  } catch (err) {
    console.log(err);
  }
  return trains;
}
