const Axios = require('axios');
const Moment = require('moment-timezone');
// const firebase = require('firebase');

Moment.tz.setDefault('Europe/Oslo');

const iftttUrlKey = process.env.IFTTT_KEY;

/*
firebase.initializeApp({
  databaseURL: 'https://tellulf-151318.firebaseio.com/',
});
*/

//const dbRef = firebase.database().ref('steca/currentData');
//const settingsRef = firebase.database().ref('steca/thresholds');

const minutesBetweenChanges = 0;
const minutesBetweenRuns = 5;

const defaultThresholds = {
  upwards: 850,
  downwards: 750,
  moment: 1500,
};

const initState = (
  name: string,
  urlCodeOpen: string,
  urlCodeClose: string,
  startTimeThresholdInMinutesOfDay = 0,
) => {
  return {
    name,
    urlCodeOpen,
    urlCodeClose,
    desiredState: 'start',
    lastChange: 'start',
    lastChangeTime: Moment(),
    timeThreshold: startTimeThresholdInMinutesOfDay,
  };
};

class SolAnal {
  dbRef: any;
  settingsRef: any;
  firebase: any;
  states: {
    stue: any;
    tak: any;
  };
  currentEffect: number = 0;
  sunListener: any;
  currentAverage: number = 0;
  settingsListener: any;
  thresholds: {
    upwards: number;
    downwards: number;
    moment: number;
  };
  constructor(firebase: any) {
    this.firebase = firebase;
    this.dbRef = firebase.database().ref('steca/currentData');
    this.settingsRef = firebase.database().ref('steca/thresholds');
    this.states = {
      tak: initState('takvindu', 'roof_open', 'roof_close', 420),
      stue: initState('stue', 'suntrigger_open', 'suntrigger_close', 660),
    };
    // this.states.v2 = initState('stuevindu 2','dummy_open', 'dummy_close', 810); // Vindu fra vegg mot a
    // this.states.v3 = initState('høyt vindu v peis', 'door1_open', 'door1_close', 740); // Vindu fra vegg mot a
    // this.states.v4 = initState('screen mot a', 'door2_open', 'door2_close', 700); // Vindu fra vegg mot a
    // this.states.v5 = initState('stuedør', 'door_up', 'door_close', 700); // Dør
    // this.states.v6 = initState('screen mot c', 'door4_open', 'door4_close', 660); // Vindu fra vegg mot a

    //this.currentAverage = undefined;
    //this.currentEffect = undefined;

    this.thresholds = defaultThresholds;

    setInterval(() => this.doCheck(), minutesBetweenRuns * 60000);
    setTimeout(() => this.doCheck(), 5000);

    console.log('SolAnal created, thresholds:', this.thresholds);

    this.settingsListener = this.settingsRef.on('value', (snapshot: any) => {
      try {
        const data = snapshot.val();
        if (data && data.upwards) {
          this.thresholds.upwards = data.upwards;
        } else {
          // console.log('upwards threshold not set');
          //settingsRef.update({ upwards: defaultThresholds.upwards });
        }
        if (data && data.downwards) {
          this.thresholds.downwards = data.downwards;
        } else {
          console.log('downwards threshold not set');
        }
        if (data && data.moment) {
          this.thresholds.moment = data.moment;
        } else {
          // settingsRef.update({ moment: defaultThresholds.moment });
          console.log('moment threshold not set');
        }

        console.log('Thresholds loaded', this.thresholds);
      } catch (err) {
        console.log(err);
      }
    });

    this.sunListener = this.dbRef.on('value', (snapshot: any) => {
      try {
        const data = snapshot.val();
        const baseData = {
          now: data.averages['1'],
          nowAveraged: data.averages['30'],
        };
        this.currentAverage = baseData.nowAveraged;
        this.currentEffect = baseData.now;
        console.log('SolAnal: New solar data received: ', baseData.nowAveraged);
        this.checkIfWeShouldDoAnything(baseData);
      } catch (err) {
        console.log(err);
      }
    });
  }

  doCheck() {
    const now = Moment();

    Object.keys(this.states).forEach((key) => {
      const timeSinceLastChange = now.diff(this.states[key].lastChangeTime, 'minutes');
      const timeToStartDoingStuffForThisOne = Moment()
        .startOf('day')
        .add(this.states[key].timeThreshold, 'minutes');

      if (timeSinceLastChange < minutesBetweenChanges) {
        console.log(`${now.format('LT')} ${key}: Deferring due to recent change or startup.`);
        return;
      }

      if (this.states[key].desiredState === 'start') {
        console.log(`${key}: Waiting, not yet analyzed!`);
        return;
      }

      if (timeToStartDoingStuffForThisOne.isAfter(now)) {
        console.log(
          `${now.format(
            'LT',
          )} ${key}: Waiting, too early in the day, will start at ${timeToStartDoingStuffForThisOne.format(
            'LT',
          )}`,
        );
        return;
      }

      if (this.states[key].desiredState !== this.states[key].lastChange) {
        this.doTheThing(key, this.states[key].desiredState);
      }
    });
  }

  async doTheThing(key: any, instruction: any) {
    try {
      console.log(`Performing instruction: ${key} ${instruction}`);
      this.states[key].lastChange = instruction;
      this.states[key].lastChangeTime = Moment();

      let url;
      let iftttKey;

      if (instruction === 'open') {
        iftttKey = this.states[key].urlCodeOpen;
      } else if (instruction === 'closed') {
        iftttKey = this.states[key].urlCodeClose;
      } else {
        console.log(`${key} ${instruction} Bad instruction, or no change detected`);
        return;
      }

      url = `https://maker.ifttt.com/trigger/${iftttKey}/with/key/${iftttUrlKey}`;
      let result = await Axios.get(url);
      console.log(`Performed instruction: ${key} ${instruction}, ${result.statusText}`);
    } catch (err) {
      console.log(`Error performing instruction  ${key} ${instruction}`, err);
    }
  }

  checkIfWeShouldDoAnything(analysis: any) {
    let closeMoment = false;
    if (analysis.now > this.thresholds.moment) {
      closeMoment = true;
    }
    let closeAveraged = false;
    if (analysis.nowAveraged > this.thresholds.upwards) {
      closeAveraged = true;
    }
    let openAveraged = false;
    if (analysis.nowAveraged < this.thresholds.downwards) {
      openAveraged = true;
    }
    let close = closeAveraged || closeMoment;
    let open = openAveraged;
    let desiredState: any;
    if (close) {
      desiredState = 'closed';
    } else {
      desiredState = 'open';
    }
    Object.keys(this.states).forEach((key) => {
      this.states[key].desiredState = desiredState;
    });
  }
}

export default SolAnal;
