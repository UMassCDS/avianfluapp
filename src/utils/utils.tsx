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
