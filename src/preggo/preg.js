/* eslint max-len: 0 */
export default class Preg {
  constructor(startDate) {
    this.fweight = [1, 2, 4, 7, 14, 23, 43, 70, 100, 140, 190, 240, 300, 360, 420, 500, 580, 660, 760, 875, 1125, 1275, 1450, 1625, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3175, 3350, 3525, 3675];
    this.fheight = [1.6, 2.3, 3.1, 4.1, 5.4, 7.4, 8.7, 10.1, 11.6, 13, 14.2, 15.3, 16.4, 26.7, 27.8, 28.9, 30, 34.6, 35.6, 36.6, 37.6, 38.6, 39.9, 41.1, 42.4, 43.7, 45, 46.2, 47.4, 48.6, 49.8, 50.7, 51.2, 51.7, 51.7];

    this.dayMilliSecs = 86400000;
    this.weekMilliSecs = this.dayMilliSecs * 7;

    this.daysInTotal = 283;

    this.diffStupid = 13 * this.dayMilliSecs; // 13 days
    this.itLastsFor = this.daysInTotal * this.dayMilliSecs; // 282 days
    this.twelveW = (12 * this.dayMilliSecs * 7) - this.dayMilliSecs; // 12 weeks

    this.start = startDate;
    this.startStupid = new Date(startDate.getTime() - this.diffStupid);
    this.end = new Date(this.startStupid.getTime() + this.itLastsFor);
    this.w12 = new Date(this.startStupid.getTime() + this.twelveW);
    this.length = this.end - this.start;
  }

  getPercent(now) {
    const done = now - this.start;
    return (done / this.length) * 100;
  }

  getWeek(now) {
    const nowForDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const timePassed = (nowForDate - this.startStupid) + this.dayMilliSecs;
    const weeksPassed = Math.floor(timePassed / this.weekMilliSecs);
    return weeksPassed;
  }

  getDays(now) {
    const nowForDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const timePassed = nowForDate - this.startStupid;
    const daysPassed = 1 + Math.floor(timePassed / 86400000);
    return daysPassed;
  }

  getTimeForPercent(percent) {
    const x = percent * this.length;
    const timestamp = Math.round(x + this.start.getTime());
    return new Date(timestamp);
  }

  getCalculations(now = new Date()) {
    const out = {};
    out.percent = this.getPercent(now);
    out.week = this.getWeek(now);
    out.day = this.getDays(now);
    out.dayOfWeek = (out.day % 7);
    out.weight = this.getWeight(out.week, out.dayOfWeek);
    out.height = this.getHeight(out.week, out.dayOfWeek);
    out.chance = getOdds(out.day);
    out.w12 = this.w12;
    out.end = this.end;
    out.left = this.daysInTotal - out.day;

    return out;
  }

  getHeight(week, day) {
    let r;
    const base = this.fheight[week - 8];

    if (week === 20) {
      // var base = this.fheight[week - 8];

      r = base + (day * 0.2);

      return Number(r.toPrecision(2));
    } else if (week >= 8 && week < 42) {
      // var base = this.fheight[week - 8];
      const next = (this.fheight[week - 7] - base) * (day / 7);

      r = (base + next);

      return Number(r.toPrecision(2));
    }
    return 0;
  }

  getWeight(week, day) {
    let r;

    if (week >= 8 && week < 42) {
      const base = this.fweight[week - 8];
      const next = (this.fweight[week - 7] - base) * (day / 7);

      r = (base + next);

      return Number(r.toPrecision(2));
    }
    return 0;
  }
}

function getOdds(day) {
  if (day < 21) {
    return false;
  } else if (day > 105) {
    return false;
  }
  const endswell = defineEndsWell();
  return endswell[day];
}

function defineEndsWell() {
  const endswell = {};

  endswell[21] = 0.738;
  endswell[22] = 0.744;
  endswell[23] = 0.75;
  endswell[24] = 0.756;
  endswell[25] = 0.762;
  endswell[26] = 0.768;
  endswell[27] = 0.774;
  endswell[28] = 0.781;
  endswell[29] = 0.787;
  endswell[30] = 0.793;
  endswell[31] = 0.799;
  endswell[32] = 0.805;
  endswell[33] = 0.811;
  endswell[34] = 0.817;
  endswell[35] = 0.824;
  endswell[36] = 0.829;
  endswell[37] = 0.834;
  endswell[38] = 0.839;
  endswell[39] = 0.844;
  endswell[40] = 0.849;
  endswell[41] = 0.854;
  endswell[42] = 0.86;
  endswell[43] = 0.867;
  endswell[44] = 0.875;
  endswell[45] = 0.882;
  endswell[46] = 0.889;
  endswell[47] = 0.897;
  endswell[48] = 0.904;
  endswell[49] = 0.912;
  endswell[50] = 0.916;
  endswell[51] = 0.92;
  endswell[52] = 0.925;
  endswell[53] = 0.929;
  endswell[54] = 0.933;
  endswell[55] = 0.938;
  endswell[56] = 0.942;
  endswell[57] = 0.944;
  endswell[58] = 0.946;
  endswell[59] = 0.948;
  endswell[60] = 0.95;
  endswell[61] = 0.951;
  endswell[62] = 0.953;
  endswell[63] = 0.955;
  endswell[64] = 0.957;
  endswell[65] = 0.959;
  endswell[66] = 0.961;
  endswell[67] = 0.963;
  endswell[68] = 0.965;
  endswell[69] = 0.967;
  endswell[70] = 0.969;
  endswell[71] = 0.97;
  endswell[72] = 0.97;
  endswell[73] = 0.971;
  endswell[74] = 0.972;
  endswell[75] = 0.97;
  endswell[76] = 0.973;
  endswell[77] = 0.974;
  endswell[78] = 0.974;
  endswell[79] = 0.975;
  endswell[80] = 0.976;
  endswell[81] = 0.977;
  endswell[82] = 0.977;
  endswell[83] = 0.978;
  endswell[84] = 0.979;
  endswell[85] = 0.979;
  endswell[86] = 0.98;
  endswell[87] = 0.981;
  endswell[88] = 0.981;
  endswell[89] = 0.982;
  endswell[90] = 0.983;
  endswell[91] = 0.983;
  endswell[92] = 0.984;
  endswell[93] = 0.984;
  endswell[94] = 0.985;
  endswell[95] = 0.985;
  endswell[96] = 0.986;
  endswell[97] = 0.986;
  endswell[98] = 0.987;
  endswell[99] = 0.987;
  endswell[100] = 0.988;
  endswell[101] = 0.988;
  endswell[102] = 0.989;
  endswell[103] = 0.989;
  endswell[104] = 0.99;
  endswell[105] = 0.99;

  return endswell;
}
