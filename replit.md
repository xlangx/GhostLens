# Historic Photo Overlay Camera App

## Overview

This is a Progressive Web App (PWA) that allows users to overlay historic photos onto their camera view for photo recreation. The app uses the device camera to capture live video, allows users to upload historic reference photos, and provides tools to align, transform, and blend these images for accurate photo recreation. Users can adjust overlay opacity, position, scale, and rotation through both touch gestures and control panels, then capture the final composed image.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern React features
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **TanStack React Query** for efficient data fetching and state management
- **Tailwind CSS** with CSS custom properties for consistent theming and responsive design
- **Shadcn/ui** component library providing pre-built, accessible UI components

### PWA Implementation
- Service worker for offline functionality and caching
- Web app manifest for installable app experience
- Touch gesture support for mobile-first interaction
- Camera API integration for live video streaming

### State Management
- Custom React hooks for camera management, overlay operations, and gesture handling
- React Context for global state where needed
- Local component state for UI interactions
- Memory-based storage interface with extensible design for future database integration

### UI/UX Design
- Dark theme optimized for camera usage
- Touch-friendly gesture controls for overlay manipulation
- Responsive design supporting both mobile and desktop
- Accessible components using Radix UI primitives

### Camera and Media Handling
- WebRTC getUserMedia API for camera access
- Canvas-based overlay rendering and photo composition
- Real-time video processing for overlay blending
- File handling for historic photo uploads

### Backend Architecture
- **Express.js** server with TypeScript
- Modular routing system with API prefix structure
- Abstract storage interface allowing for multiple implementations
- Development-focused logging and error handling
- Vite integration for seamless full-stack development

## External Dependencies

### Database and ORM
- **Drizzle ORM** configured for PostgreSQL with migration support
- **Neon Database** serverless PostgreSQL for cloud deployment
- Schema defined with Zod validation for type safety

### UI and Styling
- **Radix UI** primitives for accessible, unstyled components
- **Tailwind CSS** for utility-first styling
- **Lucide React** for consistent iconography
- **Class Variance Authority** for component variant management

### Development Tools
- **TypeScript** for static typing across the full stack
- **ESBuild** for fast production builds
- **PostCSS** with Autoprefixer for CSS processing
- **Replit** integration for development environment support

### Media and Gestures
- **Embla Carousel** for potential image gallery features
- Custom gesture handling implementation for touch interactions
- Canvas API for image composition and photo capture

### PWA Features
- Native service worker implementation
- Web app manifest for installation prompts
- Camera permissions and media device enumeration