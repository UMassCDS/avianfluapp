import ab_dates from '../assets/abundance_dates.json';
import mv_dates from '../assets/movement_dates.json';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const datasets = [ab_dates, mv_dates, ab_dates, ab_dates];

/** Display start date and location for inflow/outflow calculation. */
export default function FlowSummary({ location, startWeek, hidden = false }: { location: string[]; startWeek: number; hidden?: boolean }) {
  const dataIndex = useSelector((state: RootState) => state.species.dataIndex);

  const dateLabel = datasets[dataIndex][startWeek]?.label || datasets[dataIndex][startWeek]?.date || '';

  let locationLabel = '-';
  if (location && location.length > 0 && location[0]) {
    const [lat, lon] = location[0].split(',').map(Number);
    locationLabel = `${lat.toFixed(1)} N, ${Math.abs(lon).toFixed(1)} W`;
  }

  return (
    <div
      aria-hidden={hidden}
      style={{
        visibility: hidden ? 'hidden' : 'visible',
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 10,
        padding: '6px 10px',
        fontSize: 12,
        maxWidth: '240px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        whiteSpace: 'nowrap',
      }}
    >
      <div>
        <strong>Start Date:</strong> {dateLabel}
      </div>
      <div>
        <strong>Start Location:</strong> {locationLabel}
      </div>
    </div>
  );
}
