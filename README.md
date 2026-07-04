# SafeRaste

SafeRaste is a mobile-first Progressive Web App (PWA) designed to provide dynamic, time-aware route safety insights for women. It leverages geographic map data and simulates an AI-driven memory lifecycle (Graph Database concepts) to highlight the relative safety of urban street segments across different times of the day.

## Key Features

- **Interactive Safety Map:** A responsive, full-screen Leaflet map focused on Pune, India, featuring accurate topological road traces powered by OSRM.
- **Time-Aware Insights:** Real-time safety scores change dynamically based on the selected time of day (Morning, Afternoon, Evening, Night).
- **Client-Side Simulation:** Built for a zero-latency hackathon demonstration, the frontend fully simulates a Graph Database memory lifecycle (Remember, Recall, Improve, Forget) directly in the browser state.
- **Backend Seed Integration:** Includes a Python-based knowledge graph data generator (`seed_data.py`) capable of seeding 120 synthetic incident reports across 10 distinct city segments into Cognee.

## Technology Stack

- **Frontend:** React, Vite, Leaflet, Vanilla CSS
- **Data Pipeline (Backend Demo):** Python, Cognee, OpenStreetMap Routing (OSRM)

## Getting Started

Follow these instructions to run the SafeRaste web application locally on your machine.

### Prerequisites
- Node.js (v18 or higher recommended)
- Python 3.10+ (only if you intend to run the backend seed scripts)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Professor471/SafeRaste.git
   cd SafeRaste
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the application:**
   Open your browser and navigate to the local URL provided by Vite (typically `http://localhost:3000` or `http://localhost:5173`).

## Project Structure

- `src/App.jsx`: The core React application containing the UI, time-of-day filters, and the local memory simulation logic.
- `src/App.css`: Dark-mode optimized styles and responsive layout definitions.
- `seed_data.py`: A Python script used to synthesize and ingest 120 route safety reports across 10 Pune street segments into a Cognee graph database.
- `SafeRaste_Build_Process.md`: Historical build logs and design rationale from earlier development phases.

## How the Simulation Works

Rather than incurring API latency from a live backend during the demo, SafeRaste simulates the "Memory Lifecycle" directly in the client:
- **Recall:** Filters reports strictly relevant to the user's currently selected `Time of Day`.
- **Improve:** Dynamically calculates an aggregated safety score (Safe, Cautious, Unsafe) for each street segment by evaluating the sentiment and severity of historical reports.
- **Render:** Updates the topological polylines on the map with universally recognizable color thresholds (Green, Yellow, Red).
