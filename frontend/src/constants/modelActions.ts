export type ActionPanelSlot =
  | "camera"
  | "config"
  | "timer"
  | "tries"
  | "playPause"
  | "sound"
  | "forward"
  | "visualize"
  | "repeat";

export interface ModelActionbarConfig {
  leadSlot: "camera" | "config" | "none";
  counterSlot: "timer" | "tries" | "none";
  actions: ActionPanelSlot[];
}

export const MODEL_ACTIONBAR_REGISTRY: Record<string, ModelActionbarConfig> = {
  supervised: {
    leadSlot: "camera",
    counterSlot: "timer",
    actions: ["camera", "timer", "playPause", "sound", "forward"],
  },
  reinforcement: {
    leadSlot: "config",
    counterSlot: "tries",
    actions: ["config", "tries", "playPause", "sound", "repeat", "visualize", "forward"],
  },
  autoplay: {
    leadSlot: "camera",
    counterSlot: "timer",
    actions: ["camera", "timer", "playPause", "sound", "visualize"],
  },
};

export function getActionbarConfig(mode: string = "supervised"): ModelActionbarConfig {
  return MODEL_ACTIONBAR_REGISTRY[mode] || MODEL_ACTIONBAR_REGISTRY.supervised;
}
