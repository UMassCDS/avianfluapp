import { MantineThemeOverride } from '@mantine/core';
// Override for the default mantine theming settings
// https://v1.mantine.dev/pages/theming/
const Theme: MantineThemeOverride = {
  colors: {
    gray: [
      '#F2F3F2',
      '#DBDDDA',
      '#C3C6C2',
      '#ACB0AA',
      '#959A93',
      '#7D847B',
      '#646A62',
      '#4B4F4A',
      '#323531',
      '#191A19',
    ],
    red: [
      '#FBEAEA',
      '#F3C4C4',
      '#EB9E9E',
      '#E37878',
      '#DB5252',
      '#D32C2C',
      '#A92323',
      '#7F1A1A',
      '#551111',
      '#2A0909',
    ],
    orange: [
      '#FFF4E5',
      '#FFE1B8',
      '#FFCD8A',
      '#FFBA5C',
      '#FFA62E',
      '#FF9300',
      '#CC7500',
      '#995800',
      '#663B00',
      '#331D00',
    ],
    yellow: [
      '#FFF8E5',
      '#FFECB8',
      '#FFE08A',
      '#FFD45C',
      '#FFC82E',
      '#FFBB00',
      '#CC9600',
      '#997000',
      '#664B00',
      '#332500',
    ],
    green: [
      '#F0F6EF',
      '#D5E5D2',
      '#BAD4B5',
      '#9FC398',
      '#84B27B',
      '#68A15E',
      '#54814B',
      '#3F6138',
      '#2A4125',
      '#152013',
    ],
    teal: [
      '#E5FCFF',
      '#B8F6FF',
      '#8AF0FF',
      '#5CEAFF',
      '#2EE5FF',
      '#00DFFF',
      '#00B2CC',
      '#008699',
      '#005966',
      '#002D33',
    ],
    cyan: [
      '#EDF7F5',
      '#CEE9E4',
      '#AEDAD2',
      '#8FCCC1',
      '#6FBEAF',
      '#50AF9E',
      '#408C7E',
      '#30695F',
      '#20463F',
      '#102320',
    ],
    blue: [
      '#E5F1FF',
      '#B8D7FF',
      '#8ABDFF',
      '#5CA4FF',
      '#2E8AFF',
      '#0070FF',
      '#005ACC',
      '#004399',
      '#002D66',
      '#001633',
    ],
    purple: [
      '#EFEFF5',
      '#D3D3E4',
      '#B7B6D3',
      '#9B99C1',
      '#7F7DB0',
      '#63609F',
      '#4F4D7F',
      '#3C3A5F',
      '#28273F',
      '#141320',
    ],
    pink: [
      '#FFE9E6',
      '#FFC1B8',
      '#FE998A',
      '#FE715D',
      '#FE492F',
      '#FE2101',
      '#CB1A01',
      '#981401',
      '#660D00',
      '#330700',
    ],
  },

  primaryColor: 'red',
  fontFamily: 'Open Sans, sans-serif',
};

export default Theme;
