export const FLOW_SEARCH_SLOT_ID = 'flow-search-slot';

/**
 * Mount point for the geosearch control (MapView's SearchHandler moves it here).
 */
export default function FlowSearchSlot({ onSearchButtonClick }: { onSearchButtonClick?: () => void }) {
  return (
    <div
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest('a.leaflet-bar-part')) onSearchButtonClick?.();
      }}
      id={FLOW_SEARCH_SLOT_ID}
      className="leaflet-touch relative z-0 flex"
      style={{ isolation: 'isolate', marginTop: 'var(--mantine-spacing-md)' }}
    />
  );
}
