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
     - Detailed Notes:
       - This timeline slider was built using Mantine's builtin RangeSlider() component.
       - There are also many functionalities that Pam jampacked into this single file (Timeline.tsx) that I'm not too sure of, but the main ones I've noticed are: update image overlays, playback/pause button, and draggable date picker.
       - The draggable date picker is actually a separate component from RangeSlider(). This picker is implemented internally by Pam using useMove() hook (which is also what I used to implement custom fixed range slider for inflow/outflow).

   - **InflowOutflowTimeline (`src/components/InflowOutflowTimeline.tsx`)**
     - Specialized timeline for inflow/outflow data
     - Custom range slider for week selection
     - Detailed Notes:
       - The main difference of InflowOutflow slider compared to Timeline slider is that it only allows a fixed distance between the left and right thumb.
       - Left thumb is the "real" thumb that can move, right thumb is just there for decorative purpose, to let users know what the end date for prediction is.
       - The custom slider is implemented using the useMove() hook taken from the Mantine library. Put simply, the way it works is that when the user clicks anywhere on the parent container, useMove() will update its own internal state value, and this value is what you use to update the slider thumb's position.

4. **ControlBar (`src/components/ControlBar.tsx`)**
   - Data type selection dropdown (abundance/movement/inflow/outflow)
   - Species selection dropdown

### Supporting Components

1. **Legend (`src/components/Legend.tsx`)**

   - Displays data scale and color coding legend (bottom left)

2. **OutbreakPoints (`src/components/OutbreakPoints.tsx`)**

   - Manages and displays avian influenza outbreak data
   - Includes outbreak legend and point visualization

3. **AboutButtons (`src/components/AboutButtons.tsx`)**
   - Navigation controls for About and Feedback pages
   - Test API functionality

# Redux Store Documentation

This directory contains the Redux store configuration and slices for the Avian Flu Application.

## Redux Store Structure

The store is configured using Redux Toolkit and consists of the following slices:

### UI Slice (`uiSlice.tsx`)

Manages UI-related state:

- `isMonitor`: Boolean flag for monitor mode
- `iconSize`: Mantine size for icons
- `textSize`: Mantine size for text
- `fontHeight`: Font height in pixels
- `titleSize`: Title size in pixels

### Species Slice (`speciesSlice.tsx`)

Manages species and data-related (abundance/movement/inflow/outflow) state and data.

### Timeline Slice (`timelineSlice.tsx`)

Manages timeline-related state and data.

### Map Slice (`mapSlice.tsx`)

Manages map-related state and data.

### Usage

#### Accessing State

```typescript
import { useSelector } from 'react-redux';
import { RootState } from './store';

// In your component
const uiState = useSelector((state: RootState) => state.ui);
```

#### Dispatching Actions

```typescript
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { setIsMonitor } from './slices/uiSlice';

// In your component
const dispatch = useDispatch<AppDispatch>();
dispatch(setIsMonitor(true));
```

#### Type Definitions

The store exports two important types:

- `RootState`: Type for the entire Redux state
- `AppDispatch`: Type for the dispatch function

## Adding New Slices

To add a new slice:

1. Create a new file in the `slices` directory
2. Define your state interface and initial state
3. Create the slice using `createSlice`
4. Add the reducer to the store configuration in `store.ts`

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
