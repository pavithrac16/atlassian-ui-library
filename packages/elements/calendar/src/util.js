// @flow

import type { Date } from './types';

type DateToStringOptions = {
  fixMonth: boolean,
};

const i18n = {
  'en-au': {
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    weekdays: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
  },
};

function getI18n() {
  return i18n['en-au'];
}

function pad(num) {
  return num < 10 ? `0${num}` : num;
}

export function getDayName(i: number) {
  return getI18n().weekdays[i].substring(0, 3);
}

export function getMonthName(i: number) {
  return getI18n().months[i - 1];
}

export function dateToString(
  date: Date,
  { fixMonth }: DateToStringOptions = {},
) {
  return date
    ? `${date.year}-${pad(date.month + (fixMonth ? 1 : 0))}-${pad(date.day)}`
    : '';
}

export function makeArrayFromNumber(i: number) {
  const arr = [];
  const num = Math.ceil(i);
  for (let a = 0; a < num; a += 1) {
    arr.push(a);
  }
  return arr;
}
