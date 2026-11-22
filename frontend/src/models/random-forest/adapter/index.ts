export interface FeatureAdapter<T = any> {
  toVector: (data: T, featureNames: string[]) => Float32Array;
  toMap: (data: T) => Record<string, number>;
}

export const randomForestAdapter: FeatureAdapter<Record<string, number>> = {
  toVector: (data, featureNames) => {
    const arr = new Float32Array(featureNames.length);
    for (let i = 0; i < featureNames.length; i++) {
      arr[i] = data[featureNames[i]] ?? 0;
    }
    return arr;
  },
  toMap: (data) => ({ ...data }),
};
