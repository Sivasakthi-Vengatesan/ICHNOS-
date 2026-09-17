# TraceLake-V

> **Lightweight Telemetry Visualizer, Distributed Trace Inspector, and Execution Lineage Platform.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.0+-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=flat-square&logo=github)](https://sivasakthi-vengatesan.github.io/tracelake-v/)

---

## The Problem

Traditional linear log streams fail when debugging modern asynchronous data flows, distributed jobs, and multi-stage event pipelines—isolated log lines cannot convey causal dependencies, parent-child span hierarchy, or cumulative latency across service boundaries. TraceLake-V bridges this observability gap by transforming raw execution traces and transformation events into interactive dependency DAGs, waterfall timelines, and actionable bottleneck diagnostics.

---

## Key Features

- **Interactive Trace Waterfall & Execution DAG**: Visualize complex parent-child span relationships, critical path bottlenecks, and stage-by-stage execution timelines with sub-millisecond precision.
- **Deep Span & Metadata Inspection**: Drill down into individual spans to inspect execution duration, error stacks, input/output payload schemas, HTTP status codes, and attribute key-value pairs.
- **Multi-Level Lineage & Root-Cause Isolation**: Track table and column-level data transformations across pipeline versions, identifying the exact code commit or step that introduced downstream data anomalies.
- **Real-Time Telemetry Filtering & Search**: Instant query engine to filter spans by service name, execution status (`OK`, `ERROR`, `VIOLATED`), latency thresholds ($p50, p95, p99$), and custom metadata tags.
- **Decoupled, Modular Architecture**: Type-safe TypeScript frontend paired with a modular ingestion parser that easily integrates with standard telemetry formats and backend sinks.

---

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TRACELAKE-V PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ Data Sources / Jobs ]                                                   │
│   (Kafka, Spark, Async Workers, REST APIs)                                  │
│             │                                                               │
│             ▼ (JSON Traces / OTLP Payloads)                                 │
│   [ Telemetry Ingestion Layer ] (FastAPI / Static JSON Adapter)             │
│             │                                                               │
│             ▼ (Parsed Span Trees & DAG Relations)                           │
│   [ TraceLake-V Core Engine ]                                               │
│       ├── Trace Hierarchy Parser (Parent-Child Linking & Durations)         │
│       ├── Lineage & Schema Resolver (Column-Level Dependency Map)           │
│       └── Latency & Critical Path Analyzer                                  │
│             │                                                               │
│             ▼ (State-Driven Reactive Rendering)                             │
│   [ Modern Developer UI ]                                                   │
│       ├── Timeline / Waterfall View                                         │
│       ├── Interactive Pipeline DAG Graph                                    │
│       ├── Span Metadata & Counterexample Drawer                             │
│       └── Time-Travel Version Comparison                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Python**: 3.10+ (optional, for running the local verification backend)

### 1. Clone the Repository
```bash
git clone https://github.com/Sivasakthi-Vengatesan/tracelake-v.git
cd tracelake-v
```

### 2. Frontend Setup & Development Server
```bash
# Navigate to the frontend workspace
cd frontend

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

Open `http://localhost:5173` in your browser to view the interactive trace visualizer.

### 3. (Optional) Run the FastAPI Backend & Verification Engine
```bash
# From project root
cd backend
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Install backend dependencies & start server
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Running with Docker Compose
```bash
docker compose up --build
```
- **TraceLake-V Frontend**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`

---

## Component Architecture

```
frontend/src/
├── components/
│   ├── ArchitectureView.tsx     # System pipeline & DAG layout renderer
│   ├── BenchmarkView.tsx        # Latency breakdown & statistical metrics
│   ├── EventExplorer.tsx        # Filterable span list and metadata inspector
│   ├── LineageGraph.tsx         # Node-link multi-tier lineage visualization
│   └── TimelineWaterfall.tsx    # Horizontal span execution waterfall
├── hooks/
│   ├── useTraceData.ts          # Telemetry state management & querying
│   └── useFilterState.ts        # Attribute and latency search filter bindings
└── types/
    └── telemetry.ts             # TypeScript interfaces for Spans, Traces, DAG nodes
```

---

## Roadmap & Upcoming Milestones

- [ ] **OpenTelemetry (OTLP) Collector Integration**: Native HTTP/gRPC ingestion endpoint conforming to standard OpenTelemetry span protobuf definitions.
- [ ] **Embedded Analytical Storage Engine**: DuckDB / ClickHouse query adapter for querying historical trace repositories with millions of spans.
- [ ] **Live Telemetry WebSocket Stream**: Real-time push stream for monitoring active distributed pipeline executions as spans emit.
- [ ] **Trace Comparison Diff Engine**: Visual side-by-side execution diff tool to identify performance regressions between software releases.

---

## Contributing

Contributions are welcome! Please submit an issue to report bugs or submit a Pull Request following standard development conventions:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/span-flamegraph`)
3. Commit your Changes (`git commit -m 'feat: add span flamegraph component'`)
4. Push to the Branch (`git push origin feature/span-flamegraph`)
5. Open a Pull Request

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.
