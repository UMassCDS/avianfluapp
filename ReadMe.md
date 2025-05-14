# Avian Flu App

A web application for visualizing avian influenza data, including bird abundance, movement patterns, and outbreak information across North America.

## Overview

This application provides an interactive visualization platform for avian influenza data, allowing users to:

- View bird abundance and movement patterns across North America
- Track avian influenza outbreaks
- Analyze inflow and outflow patterns of bird populations
- Visualize data across different time periods using an interactive timeline

## Key Components

### Core Components

1. **HomePage (`src/views/Home.tsx`)**

   - Main application view
   - Manages the interactive map, timeline slider, and control widgets

2. **MapView (`src/components/MapView.tsx`)**

   - Renders the interactive map using Leaflet
   - Displays bird abundance and movement data overlays
   - Shows outbreak points and geographic information

3. **Timeline Components**

   - **Timeline (`src/components/Timeline.tsx`)**

     - Controls for abundance and movement data visualization
     - Week selection and playback functionality
     - Month labels and date navigation

   - **InflowOutflowTimeline (`src/components/InflowOutflowTimeline.tsx`)**
     - Specialized timeline for inflow/outflow data
     - Custom range slider for week selection
     - Playback controls for data visualization

4. **ControlBar (`src/components/ControlBar.tsx`)**
   - Data type selection dropdown (abundance/movement/inflow/outflow)
   - Species selection dropdown

### Supporting Components

1. **Legend (`src/components/Legend.tsx`)**

   - Displays data scale and color coding legend (bottom left)
   - Provides context for map visualization

2. **OutbreakPoints (`src/components/OutbreakPoints.tsx`)**

   - Manages and displays avian influenza outbreak data
   - Includes outbreak legend and point visualization

3. **AboutButtons (`src/components/AboutButtons.tsx`)**
   - Navigation controls for About and Feedback pages
   - Test API functionality

## State Management

The application uses Redux for global state management with the following slices:

- `uiSlice`: Manages UI preferences and responsive design
- `speciesSlice`: Handles species and data type selection
- `timelineSlice`: Controls timeline state and week selection
- `mapSlice`: Manages map overlay and visualization state

Local state management is used with React builtin state management (i.e. useState)

## Installation

1. Install Node.js at https://nodejs.org/en/download/package-manager

2. Install dependencies:

```bash
npm install
```

3. Run in development mode:

```bash
npm run dev
```

4. Create a production build:

```bash
npm run build
```

5. View the production build:

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
- Redux for state management
- Mantine UI Library for UI components
- Leaflet for map visualization
- Vite for build tooling

## Data Sources

- Abundance and Movement dates are from https://github.com/birdflow-science/BirdFlowWork/tree/main/avian_influenza/dates
