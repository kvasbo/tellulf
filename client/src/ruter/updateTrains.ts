import createEnturService from '@entur/sdk';
import Moment from 'moment';
import { TrainData, TrainDataSet } from '../types/trains';

const VINDEREN_BANE = 'NSR:StopPlace:6245';
const VINDEREN_BUSS = 'NSR:StopPlace:6248'; // Slemdal
const BANE_SPOR = '2';
const BUSS_DESTINASJON = 'Majorstuen';

// const SLEMDAL_BUSS = 'NSR:StopPlace:6273';
// const SLEMDAL_BANE = 'NSR:StopPlace:6284';

// Fetch Entur API data
export default async function getTrains(): Promise<TrainDataSet> {
  const trains: TrainDataSet = {};
  try {
    // New
    const entur = createEnturService({ clientName: 'kvasbo-infoskjerm' });

    const trips = await entur.getDeparturesFromStopPlaces([VINDEREN_BANE, VINDEREN_BUSS]);

    trips?.forEach((t) => {
      t?.departures.forEach((d) => {
        // Bane
        if (
          d.forBoarding &&
          d.quay?.stopPlace.id === VINDEREN_BANE &&
          d.quay?.publicCode === BANE_SPOR
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
        } else if (d.forBoarding && d.destinationDisplay.frontText === BUSS_DESTINASJON) {
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
