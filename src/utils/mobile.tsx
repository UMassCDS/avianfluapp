import { useMediaQuery } from '@mantine/hooks';
import { em } from '@mantine/core';


export function isMobile():boolean|undefined {
    return useMediaQuery(`(max-width: ${em(750)})`);
}
