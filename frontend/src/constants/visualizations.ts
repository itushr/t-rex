export interface VisualizationLayer {
  id: "tree_graph" | "table_steps" | "live_stream" | "metrics";
  name: string;
  description: string;
  isSupported: boolean;
}

export const VISUALIZATION_LAYERS: VisualizationLayer[] = [
  {
    id: "tree_graph",
    name: "Interactive Tree Graph",
    description: "Hierarchical SVG node rendering with active decision path highlighting",
    isSupported: true,
  },
  {
    id: "table_steps",
    name: "Prediction Step Table",
    description: "Tabular playback scrub of timestamped inference steps",
    isSupported: true,
  },
  {
    id: "live_stream",
    name: "Live WebSocket Stream",
    description: "Real-time telemetry stream from CDP driver bot",
    isSupported: true,
  },
];
