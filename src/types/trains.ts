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
  [s: number] : TrainData;
}