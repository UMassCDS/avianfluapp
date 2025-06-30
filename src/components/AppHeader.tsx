export default function AppHeader() {
  return (
    <div className="flex flex-col items-center gap-4 mb-2 mt-2">
      <div className="relative w-16 h-20 flex items-end justify-center">
        {/* Location marker - positioned on top of bird's head */}
        <div className="absolute left-1/2 top-1 z-10 -translate-x-1/2">
          <svg width="40" height="45" viewBox="0 0 40 45" style={{ display: 'block' }}>
            <path
              d="M20 4 C28 4, 36 12, 20 38 C4 12, 12 4, 20 4Z"
              fill="#228be6"
            />
            <circle cx="20" cy="16" r="7" fill="#fff"/>
            <circle cx="20" cy="16" r="4" fill="#228be6"/>
            <path
              d="M20 4 C28 4, 36 12, 20 38 C4 12, 12 4, 20 4Z"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
        </div>
        {/* Flapping bird - blue */}
        <div className="flap-bird" />
      </div>
      <h1 className="text-3xl font-bold text-blue-700 m-0 text-center font-sans">Avian Influenza</h1>
    </div>
  );
}