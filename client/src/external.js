import Moment from 'moment';

/**
 * Calculates Easter in the Gregorian/Western (Catholic and Protestant) calendar
 * based on the algorithm by Oudin (1940) from http://www.tondering.dk/claus/cal/easter.php
 * @returns {array} [int month, int day]
 */

/* eslint-disable */
/**
 * Calculates Easter in the Gregorian/Western (Catholic and Protestant) calendar
 * based on the algorithm by Oudin (1940) from http://www.tondering.dk/claus/cal/easter.php
 * @returns {array} [int month, int day]
 */
export function getEaster(year) {
    var f = Math.floor,
        // Golden Number - 1
        G = year % 19,
        C = f(year / 100),
        // related to Epact
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        // number of days from 21 March to the Paschal full moon
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        // weekday for the Paschal full moon
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        // number of days from 21 March to the Sunday on or before the Paschal full moon
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);

    return [month, day];
}
/* eslint-enable */

export function getNorwegianDaysOff(year = new Date().getFullYear()) {
    const days = [];
    days.push('0501'); // 1. mai
    days.push('1225'); // 1. juledag
    days.push('1226'); // 1. juledag
    days.push('0101'); // 1. nyttårsdag
    days.push('0517'); // 17. mai

    // All the eastery stuff
    const e = getEaster(year);
    const arr = [year, e[0] - 1, e[1]];
    const eMoment = Moment(arr);
    days.push(Moment(eMoment).subtract(3, 'days').format('MMDD')); // Torsdag
    days.push(Moment(eMoment).subtract(2, 'days').format('MMDD')); // Fredag
    days.push(Moment(eMoment).add(1, 'days').format('MMDD')); // 1. påskedag
    days.push(Moment(eMoment).add(39, 'days').format('MMDD')); // Himmelsprett
    days.push(Moment(eMoment).add(50, 'days').format('MMDD')); // 1. pinsedag

    days.sort();
    return days;
}