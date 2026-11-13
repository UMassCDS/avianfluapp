import { useState } from 'react';

/**
 * Guide for inflow/outflow steps (i.e. pick a location, then pick a start date).
 */

export default function FlowPrompt({
  show,
  title,
  message,
}: {
  show: boolean;
  title: string;
  message: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return (
    <div
      role="status"
      className="isolate absolute left-0 bottom-full mb-2 z-20 w-max max-w-[200px] px-2.5 py-2"
    >
      <div className="pulse absolute inset-0 -z-10 rounded-md bg-white shadow-lg border border-blue-300" />
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="absolute top-0.5 right-1.5 text-gray-500 hover:text-gray-800 text-base leading-none"
      >
        ×
      </button>
      <div className="font-semibold text-xs text-gray-900 pr-3">{title}</div>
      <div className="text-[11px] leading-snug text-gray-700 mt-0.5">
        {message}
      </div>
    </div>
  );
}
