export function readObstacles(runner: any) {
  const raw = runner?.horizon?.obstacles || [];
  const obs = [...raw]
    .map((o) => ({
      x: Number(o.xPos),
      y: Number(o.yPos),
      type: o.typeConfig?.type ?? "none",
      size: Number(o.size) || 1,
    }))
    .filter((o) => Number.isFinite(o.x))
    .sort((a, b) => a.x - b.x);

  while (obs.length < 2) obs.push({ x: -1, y: -1, type: "none", size: 0 });
  return obs.slice(0, 2);
}

export function extractFeatureVector(runner: any, expectedFeatures: string[]): Float32Array {
  const [obs1, obs2] = readObstacles(runner);
  const speed = Number(runner?.currentSpeed) || 0;
  const dist = obs1.x;
  const tti = dist > 0 && speed > 0 ? Number((dist / speed).toFixed(3)) : -1;

  const numericValues: Record<string, number> = {
    obstacle1_x: dist,
    obstacle1_y: obs1.y,
    obstacle1_size: obs1.size,
    obstacle2_x: obs2.x,
    obstacle2_y: obs2.y,
    obstacle2_size: obs2.size,
    speed,
    jumping: Number(Boolean(runner?.tRex?.jumping)),
    ducking: Number(Boolean(runner?.tRex?.ducking)),
    time_to_impact: tti,
  };

  const vector = new Float32Array(expectedFeatures.length);
  for (let i = 0; i < expectedFeatures.length; i++) {
    const feat = expectedFeatures[i];
    if (feat in numericValues) {
      vector[i] = numericValues[feat];
    } else if (feat.startsWith("obstacle1_type_")) {
      const type = feat.replace("obstacle1_type_", "");
      vector[i] = obs1.type === type ? 1.0 : 0.0;
    } else if (feat.startsWith("obstacle2_type_")) {
      const type = feat.replace("obstacle2_type_", "");
      vector[i] = obs2.type === type ? 1.0 : 0.0;
    } else {
      vector[i] = 0.0;
    }
  }
  return vector;
}
