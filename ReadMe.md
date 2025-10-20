# Avian Flu App

A modern web application for visualizing avian influenza data, providing comprehensive insights into bird abundance, movement patterns, and outbreak information across North America.

## Overview

This application offers an interactive platform that enables users to:

- Visualize bird abundance and movement data across North America with detailed timeline controls.
- Track avian influenza outbreaks dynamically, including Poultry, Bovine, and Wild Bird categories.
- Analyze inflow and outflow patterns for bird populations with advanced timeline playback and range selection.
- Utilize high-performance data overlays leveraging pregenerated mask layers and cache-enabled flow calculations for smooth user experience.
- Select geographic locations interactively through map clicks or address search for targeted analysis.
- Download flow projection data as GeoTIFF files for external use.
- Experience a responsive and accessible UI optimized for both desktop and mobile devices.

## Key Components

1. **HomePage (`src/views/Home.tsx`)**

   - Central component managing the interactive map, timeline playback, and control widgets.
   - Supports toggling search modes for location selection (map click or address search).
   - Integrates the `MapOverlayPanel` for displaying active data type, species, date, and location information.

2. **MapView (`src/components/MapView.tsx`)**

   - Renders the interactive Leaflet map with support for:
     - Bird abundance, movement, inflow/outflow overlays using pregenerated mask layers.
     - Dynamic outbreak visualization for Poultry, Bovine, and Wild Bird outbreaks.
     - Location selection via map click or address search, with state management reflecting choice.
   - Improved marker handling for current vs historic data visuals.
   - Responsive design enhancements for mobile layouts, including scalable legends and controls.

3. **Timeline and Playback Components**

   - **Timeline (`src/components/Timeline`)**
     - A highly modular timeline slider component supporting:
       - Range selection for abundance and movement data visualization.
       - Playback controls animating data progression over time (including 20-week projections for inflow/outflow).
       - Draggable and tooltip-enhanced markers and thumbs with consistent UI styling.
       - Support for all datasets with dynamic month labeling and hover info.

4. **ControlBar (`src/components/ControlBar.tsx`)**

   - Dropdown selectors enhanced with species icons and improved tooltip accessibility.
   - Includes toggles to control visibility of outbreak types (Poultry, Bovine, Wild Bird).
   - Streamlined styling and interaction for improved user experience.

5. **MapOverlayPanel (`src/components/MapOverlayPanel.tsx`)**

   - Displays current data context — data type, species, start date, and selected location.
   - Integrates smoothly with timeline and map interactions.

6. `InflowOutflowCalculateButton`:
   - Compute button triggers server API calls for inflow/outflow calculations with progress and error notifications.

7. **Legend (`src/components/DataLegend.tsx`)**

   - Displays data scale with updated, dynamic color coding and unit labels (`Birds/km²`).
   - Supports inflow/outflow legends when relevant and adapts layout responsively.

8. **OutbreakPoints (`src/components/OutbreakPoints.tsx`)**

   - Manages and renders multiple outbreak types with distinct icons and conditional styling.
   - Distinguishes current-year (Recent) outbreaks from historic outbreaks with opacity and color variations for clarity.
   - Integrates with map slice's outbreak visibility state.

9. **AboutButtons and About Section (`src/components/AboutButtons.tsx` and related views)**

   - Improved tabbed navigation and styling for About and Feedback pages.
   - Added external links for API testing.
   - Enhanced content describing avian influenza, data layers, and funding.

10. `FeedbackForm`
   - User feedback with non-blocking Mantine notifications on submission.

## Redux Store Documentation

### Store Structure

- **uiSlice:** UI flags including monitor mode, icon/text sizing, font height, and title size.
- **speciesSlice:** Bird species and related data management.
- **timelineSlice:** Controls timeline state, including selected weeks, modes, and playback.
- **mapSlice:** Map-related state including mask overlay usage, cached flow results (`flowResultsCache`), outbreak visibility (`showOutbreaks`), and location data.
- **outbreaksSlice:** New slice managing outbreak toggle states by type (Poultry, Bovine, Wild Bird).

### Usage Examples

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { setShowOutbreaks } from './slices/outbreaksSlice';

const dispatch = useDispatch<AppDispatch>();
const showOutbreaks = useSelector((state: RootState) => state.map.showOutbreaks);

// Toggle outbreak visibility
dispatch(setShowOutbreaks({ poultry: true, bovine: false, wildBird: true }));
```

## Adding New Slices

To add new slices such as for additional data or UI state:

1. Define the slice state interface and initial state in `slices/yourSlice.ts`.
2. Create the slice with `createSlice`.
3. Connect the reducer in `store.ts`.
4. Use typed hooks with `RootState` and `AppDispatch` for safety.

## Installation

### Prerequisites

- Node.js (install via https://nodejs.org/en/download/package-manager)

### Steps
1. Clone the repository and change to project directory.
2. Install dependencies, including new additions @mantine/notifications and Tailwind CSS packages:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Serve the production build for local testing:

```bash
serve -s
```

## Adding New Packages

To install new packages:

```bash
npm install <package> --save
```

## Technical Stack

- React with TypeScript
- Redux Toolkit for state management (with slices for outbreaks, flow, UI, timeline, species, map)
- Mantine UI Library with enhanced components and notifications
- Leaflet for advanced map visualizations with GeoTIFF and mask overlay support
- Vite for fast build tooling
- Tailwind CSS for utility-first styling integration
- GeoTIFF module for raster data handling

## Data Sources

- Bird abundance and movement data from BirdFlowWork repository:  
  https://github.com/birdflow-science/BirdFlowWork/tree/main/avian_influenza/dates
- Avian influenza outbreaks data includes Poultry, Bovine, and Wild Bird cases, updated dynamically.
- Flow projection data fetched from BirdfluAPI (production at birdfluapi.com).

## Additional Notes

- The application uses pregenerated mask overlays by default for performance.
- Inflow/outflow calculations are cached locally to minimize API requests and improve user experience.
- UI components are designed with accessibility and mobile responsiveness in mind.
- Users can download GeoTIFF files of flow projections directly from the interface.
- Notifications for user feedback and error handling leverage Mantine's notification system for a modern UX.

---

For more details, contributions, or issues, please refer to the project repository and documentation.
