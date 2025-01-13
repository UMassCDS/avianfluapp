import { useMediaQuery } from '@mantine/hooks';
import { em } from '@mantine/core';

const MSEC_TO_WEEK = 7*24*60*60*1000;

export function isMobile():boolean|undefined {
    return useMediaQuery(`(max-width: ${em(750)})`);
}

PAM not sure this is right!!!
export function dateToWeek(thisDate:Date):number {
    const startOfYear = new Date(thisDate.getFullYear(),0,1);
    const diff_dates = thisDate.valueOf()-startOfYear.valueOf()
    return Math.floor(diff_dates/MSEC_TO_WEEK);
}

export function monthDayToWeek(month:number, day:number):number {
    // the year doesn't matter, only looking for the week within the year
    const thisDate: Date = new Date(2000, month-1, day);
    const startOfYear = new Date(2000,0,1);
    const diff_dates = thisDate.valueOf()-startOfYear.valueOf()
    return Math.floor(diff_dates/MSEC_TO_WEEK);
}
