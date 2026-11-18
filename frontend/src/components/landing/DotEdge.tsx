import { BaseEdge, getBezierPath, getStraightPath, EdgeProps } from "@xyflow/react";

export function DotEdge(props: EdgeProps) {
  const isStraight = Boolean(props.data?.straight);
  const [edgePath] = isStraight ? getStraightPath(props) : getBezierPath(props);
  const dur = String(props.data?.dur || "1s");
  const stage = Number(props.data?.stage || 1);

  const keyTimes = stage === 1 ? "0;0.35;1" : stage === 2 ? "0;0.35;0.7;1" : "0;0.7;1";
  const keyPoints = stage === 1 ? "0;1;1" : stage === 2 ? "0;0;1;1" : "0;0;1";
  const opTimes = stage === 1 ? "0;0.04;0.32;0.35;1" : stage === 2 ? "0;0.35;0.39;0.67;0.7;1" : "0;0.7;0.74;0.97;1";
  const opVals = stage === 1 ? "0;0.75;0.75;0;0" : stage === 2 ? "0;0;0.75;0.75;0;0" : "0;0;0.75;0.75;0";

  return (
    <g>
      <BaseEdge path={edgePath} style={{ stroke: "#27272a", strokeWidth: 1.2 }} markerEnd={props.markerEnd} />
      {edgePath && (
        <circle r={2.2} fill="#18181b">
          <animateMotion
            dur={dur}
            repeatCount="indefinite"
            path={edgePath}
            keyPoints={keyPoints}
            keyTimes={keyTimes}
            calcMode="linear"
          />
          <animate
            attributeName="opacity"
            dur={dur}
            repeatCount="indefinite"
            values={opVals}
            keyTimes={opTimes}
          />
        </circle>
      )}
    </g>
  );
}
export default DotEdge;
