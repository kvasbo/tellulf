import Moment from 'moment';

// A train
export interface TrainData {
  ruteTid: Moment.Moment;
  faktiskTid: Moment.Moment;
  id: string;
  linje: string;
  skalTil: string;
}

// A set of train data
export interface TrainDataSet {
  [s: number] : TrainData;
}