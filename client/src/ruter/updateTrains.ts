import createEnturService from '@entur/sdk';
import Moment from 'moment';
import { TrainData, TrainDataSet } from '../types/trains';

const SLEMDAL_BUSS = 'NSR:StopPlace:6284';
const SLEMDAL_BANE = 'NSR:StopPlace:6273';
const BUSS_QUAY = 'NSR:Quay:11541';
const BANE_QUAY = 'NSR:Quay:11518';

// Fetch Entur API data
export default async function getTrains(): Promise<TrainDataSet> {
  const trains: TrainDataSet = {};
  try {
    const entur = createEnturService({ clientName: 'kvasbo-infoskjerm' });
    const trips = await entur.getDeparturesFromStopPlaces([SLEMDAL_BUSS, SLEMDAL_BANE]);

    trips?.forEach((t) => {
      t?.departures.forEach((d) => {
        // Bane
        if (d.forBoarding && d.quay?.stopPlace.id === SLEMDAL_BANE && d.quay?.id === BANE_QUAY) {
          const out: TrainData = {
            ruteTid: Moment(d.aimedArrivalTime),
            faktiskTid: Moment(d.expectedArrivalTime),
            id: d.serviceJourney.id,
            linje: '1',
            skalTil: d.destinationDisplay.frontText,
            type: 'Bane',
          };
          trains[out.id] = out;
        } else if (
          d.forBoarding &&
          d.quay?.stopPlace.id === SLEMDAL_BUSS &&
          d.quay?.id === BUSS_QUAY
        ) {
          //&& d.destinationDisplay.frontText === BUSS_DESTINASJON) {  && d.quay?.id === BUSS_QUAY
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
