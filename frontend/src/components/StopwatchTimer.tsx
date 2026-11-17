import { motion, AnimatePresence } from "framer-motion";

interface StopwatchTimerProps {
  mins: string;
  secs: string;
  ms: string;
  isRecording?: boolean;
  isRecordingPaused?: boolean;
}

function Digit({ char }: { char: string }) {
  return (
    <span className="relative inline-flex h-[1.15em] w-[0.62em] overflow-hidden justify-center items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="absolute"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function StopwatchTimer({
  mins,
  secs,
  ms,
  isRecording = false,
  isRecordingPaused = false,
}: StopwatchTimerProps) {
  const isPulsing = isRecording && !isRecordingPaused;

  return (
    <div className="flex items-baseline font-mono text-3xl font-semibold tracking-tight text-white tabular-nums select-none">
      <div className="flex items-center">
        <Digit char={mins[0] || "0"} />
        <Digit char={mins[1] || "0"} />
      </div>

      <motion.span
        animate={isPulsing ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        className="px-0.5 text-zinc-500 font-bold"
      >
        :
      </motion.span>

      <div className="flex items-center">
        <Digit char={secs[0] || "0"} />
        <Digit char={secs[1] || "0"} />
      </div>

      <span className="text-zinc-400 text-xl font-normal tabular-nums ml-0.5">
        .{ms}
      </span>
    </div>
  );
}

export default StopwatchTimer;
