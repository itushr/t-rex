export interface FeatureConfig {
  key: string;
  label: string;
  group: string;
}

export interface GameAdapter<TSample = Record<string, any>> {
  id: string;
  name: string;
  supportedModels: readonly string[];
  numericFeatures: readonly string[];
  categoricalFeatures: readonly string[];
  validActions: readonly string[];
  featureConfigs: readonly FeatureConfig[];
  snapshot: (runnerInstance: any, action: string) => TSample | null;
  getRunnerInstance: () => any;
  isGameRunning: (runnerInstance: any) => boolean;
  isGamePaused: (runnerInstance: any) => boolean;
  isGameCrashed: (runnerInstance: any) => boolean;
  restartGame: (runnerInstance: any) => void;
  pauseGame: (runnerInstance: any) => void;
  resumeGame: (runnerInstance: any) => void;
  mapKeyEventToAction: (event: KeyboardEvent) => string | null;
}
