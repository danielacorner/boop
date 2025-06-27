# Boop - Interactive 3D Fidget Application

## Overview
Boop is an interactive 3D fidget application built with React and Three.js, designed to provide an engaging and visually appealing experience. It features dynamic 3D objects, physics-based interactions, and audio-visual elements that respond to user input, creating a satisfying digital fidget experience.

## Technical Stack

- **Frontend Framework**: React with TypeScript
- **3D Rendering**: Three.js via [react-three-fiber](https://github.com/pmndrs/react-three-fiber) ecosystem
- **Physics Engine**: @react-three/cannon
- **State Management**: Jotai
- **UI Components**: Material-UI (@mui)
- **Build System**: Vite
- **Styling**: Styled Components and Emotion

## Repository Structure

- `/src` - Main source code
  - `/components` - React components including 3D objects, UI elements, and effects
  - `/Models` - 3D model definitions
  - `/store` - State management using Jotai
  - `/utils` - Utility functions and constants
- `/public` - Static assets including 3D models, HDR environments, and audio files

## Key Features

- **Interactive 3D Environment**: Dynamically rendered 3D objects with physics-based interactions
- **Adaptive Performance**: Automatic detection of device GPU capabilities with dynamic quality adjustments
- **Music Integration**: Audio elements that synchronize with visual components
- **Camera Effects**: Dynamic camera movements responding to user interactions
- **High-Quality Rendering**: Environment maps, lighting effects, and post-processing
- **Responsive Design**: Adapts to different screen sizes and device capabilities

## Components of Interest for AI Analysis

- **Scene.tsx**: Main 3D scene setup with lighting, environment, and physics
- **D20StarComponent.tsx**: Interactive 3D dice component
- **Clumpz.tsx**: Cluster of interactive objects with physics properties
- **Effects.tsx**: Post-processing visual effects
- **Music.tsx**: Audio controls and synchronization

## Setup and Usage

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build
npm run serve
```

## Performance Considerations

The application dynamically adjusts rendering quality based on device capabilities. It uses GPU detection to set appropriate levels of detail, shader complexity, and frame rates. The `AdaptDprManually` component monitors performance and adjusts the Device Pixel Ratio (DPR) accordingly.

## Original Inspiration

This project was heavily inspired by [this example](https://twitter.com/0xca0a/status/1546426814876323841) from the react-three-fiber ecosystem.
