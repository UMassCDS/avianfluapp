import { useMediaQuery } from '@mantine/hooks';
import { em } from '@mantine/core';

const MSEC_TO_WEEK = 7*24*60*60*1000;
export const WEEKS_PER_YEAR = 52;
export const MIN_WEEK = 0;   // week index
export const MAX_WEEK = WEEKS_PER_YEAR -1;  

export function isMobile():boolean|undefined {
    return useMediaQuery(`(max-width: ${em(750)})`);
}

export function dateToWeek(thisDate:Date):number {
    const startOfYear = new Date(thisDate.getFullYear(),0,1);
    const diff_dates = thisDate.valueOf()-startOfYear.valueOf()
    return Math.floor(diff_dates/MSEC_TO_WEEK);
}

export function monthDayToWeek(month:number, day:number):number {
    // the year doesn't matter, only looking for the week within the year
    return dateToWeek(new Date(2025, month-1, day));
}

/**
 * Returns the timeline position (from 0 to 100) for a given date,
 * based on how far into the current year the date's month and day occur.
 *
 * The function uses the current year for all calculations, regardless of the
 * year in the input date.
 *
 * @param {Date | string} dateInput - A JavaScript Date object or a string in `YYYY-MM-DD` format.
 * @returns {number} A number between 0 and 100 indicating percentage position on the timeline.
 *
 * @example
 * getTimelinePosition("2020-07-12"); // → 52.88 (for July 12 in the current year)
 * getTimelinePosition(new Date());  // → today's percentage position in the year
 */
export function getTimelinePosition(dateInput: Date | string): number {
  const now = new Date();
  let month: number;
  let day: number;

  if (typeof dateInput === 'string') {
    const [yearStr, monthStr, dayStr] = dateInput.split('-');
    month = parseInt(monthStr, 10) - 1; // JS months are 0-based
    day = parseInt(dayStr, 10);
  } else {
    month = dateInput.getMonth();
    day = dateInput.getDate();
  }

  const targetDate = new Date(now.getFullYear(), month, day);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const dayOfYear = Math.floor((targetDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (dateInput === '2022-01-01') {
    console.log(`targetDate: ${targetDate}`)
    console.log(`startOfYear: ${startOfYear}`)
    console.log(`dayOfYear: ${dayOfYear}`)
  }

  // Determine if current year is a leap year
  const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeapYear(now.getFullYear()) ? 366 : 365;

  // Return timeline position
  return dayOfYear / totalDays * 100;
}
