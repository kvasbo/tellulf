import Moment from 'moment';

// A train
export interface TrainData {
  ruteTid: Moment.Moment;
  faktiskTid: Moment.Moment;
  id: string;
  linje: string;
  skalTil: string;
}

// With some more data...
export interface ExtendedTrainData extends TrainData {
  fromNow: number;
  fromNowM: number;
  ruteDiff: number;
}

// A set of train data
export interface TrainDataSet {
  [s: number]: TrainData;
}

export interface EnturApiData {
  ServiceDelivery: {
    EstimatedTimetableDelivery: {
      EstimatedJourneyVersionFrame: {
        EstimatedVehicleJourney: EnturTripData[];
      };
    };
  };
}

export interface EnturTripData {
  DirectionRef: string;
  LineRef: string;
  EstimatedCalls: {
    EstimatedCall: EnturCallData[];
  };
  FramedVehicleJourneyRef: {
    DataFrameRef: string;
    DatedVehicleJourneyRef: string;
  };
}

export interface EnturCallData {
  DepartureStatus: string;
  StopPointRef: string;
  StopPointName: string;
  AimedDepartureTime: string;
  AimedArrivalTime: string;
  DestinationDisplay: string;
  ExpectedDepartureTime: string;
  ExpectedArrivalTime: string;
}
