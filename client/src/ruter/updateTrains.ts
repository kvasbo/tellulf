import createEnturService from '@entur/sdk';
import Moment from 'moment';
import { TrainData, TrainDataSet } from '../types/trains';

const BANE_SPOR = '1';
const BUSS_DESTINASJON = 'Majorstuen';

const SLEMDAL_BUSS = 'NSR:StopPlace:6284';
const SLEMDAL_BANE = 'NSR:StopPlace:6273';

// Fetch Entur API data
export default async function getTrains(): Promise<TrainDataSet> {
  const trains: TrainDataSet = {};
  try {
    const entur = createEnturService({ clientName: 'kvasbo-infoskjerm' });
    const trips = await entur.getDeparturesFromStopPlaces([SLEMDAL_BUSS, SLEMDAL_BANE]);

    trips?.forEach((t) => {
      t?.departures.forEach((d) => {
        // Bane
        if (
          d.forBoarding &&
          d.quay?.stopPlace.id === SLEMDAL_BANE &&
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
          // Buss
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
