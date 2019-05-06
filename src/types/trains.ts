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

export interface RuterApiData {
  MonitoredVehicleJourney: {
    MonitoredCall: {
      DeparturePlatformName: string;
      AimedArrivalTime: string;
      ExpectedArrivalTime: string;
    };
    PublishedLineName: string;
    DestinationName: string;
    FramedVehicleJourneyRef: {
      DataFrameRef: string;
      DatedVehicleJourneyRef: string;
    };
  };
}
