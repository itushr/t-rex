import { motion, AnimatePresence } from "framer-motion";

function Digit({ char }: { char: string }) {
  return (
    <span className="relative inline-flex h-[1.25em] w-[1.05em] overflow-hidden justify-center items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function TriesCounter({ tries }: { tries: number }) {
  const formatted = String(Math.max(1, tries)).padStart(3, "0");

  return (
    <div
      className="flex items-center text-white tabular-nums select-none tracking-normal text-base sm:text-lg"
      style={{ fontFamily: "'Press Start 2P', monospace" }}
    >
      <div className="flex items-center">
        {formatted.split("").map((c, i) => (
          <Digit key={i} char={c} />
        ))}
      </div>
    </div>
  );
}

export default TriesCounter;
