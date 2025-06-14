const express = require('express');
const app = express();
const PORT = 9000;

const baseUrl = 'https://avianinfluenza.s3.us-east-2.amazonaws.com/';
const abundanceName = 'abundance';
const dataInfo = [
  { datatype: 'inflow' },
  { datatype: 'outflow' },
];
const taxa = [
  { value: 'total' },
  { value: 'mallard3' },
  { value: 'canada_goose' },
  { value: 'ambduc' },
];

// Use abundance file paths for inflow/outflow mock
function abundanceImageURL(taxa_index, week) {
  // week is zero-based in code, filenames start at 1
  return `${baseUrl}${abundanceName}/${taxa[taxa_index].value}/${abundanceName}_${taxa[taxa_index].value}_${week+1}.png`;
}
function abundanceLegendURL(taxa_index) {
  return `${baseUrl + abundanceName}/${taxa[taxa_index].value}/scale_${abundanceName}_${taxa[taxa_index].value}.json`;
}

function buildResponse(type, req) {
  const { loc, week, taxa: taxaParam, n } = req.query;
  const weekNum = parseInt(week, 10) || 10;
  const nResults = parseInt(n, 10) || 20;
  const taxaIndex = taxa.findIndex(t => t.value === taxaParam);
  const taxaIdx = taxaIndex !== -1 ? taxaIndex : 0;

  // Mock location array
  const locations = loc ? [loc.split(',').map(Number)] : [[42.09822, -106.96289]];

  const result = [];
  if (type === 'inflow') {
    // Go backward in time, but not below week 1
    for (let i = 0; i < nResults; i++) {
      const w = weekNum - i;
      if (w < 1) break;
      result.push({
        week: w,
        url: abundanceImageURL(taxaIdx, w),
        legend: abundanceLegendURL(taxaIdx),
      });
    }
  } else if (type === 'outflow') {
    // Go forward in time, but not above week 52
    for (let i = 0; i < nResults; i++) {
      const w = weekNum + i;
      if (w > 52) break;
      result.push({
        week: w,
        url: abundanceImageURL(taxaIdx, w),
        legend: abundanceLegendURL(taxaIdx),
      });
    }
  }

  return {
    start: {
      week: weekNum,
      taxa: taxaParam || 'total',
      location: locations,
    },
    status: 'success',
    result,
  };
}

app.get('/inflow', (req, res) => {
  res.json(buildResponse('inflow', req));
});

app.get('/outflow', (req, res) => {
  res.json(buildResponse('outflow', req));
});

app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});