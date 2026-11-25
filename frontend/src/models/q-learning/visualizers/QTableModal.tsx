import { VisualizerModal } from "@/components/actionpanel/VisualizerModal";
import { QTableContent } from "./QTableContent";
import type { QTableEntry } from "@/types/rl";

export interface QTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: QTableEntry<any>[];
  epsilon: number;
  actions?: string[];
  stateHeader?: string;
  overlayClassName?: string;
  className?: string;
}

export function QTableModal({
  isOpen, onClose, entries, epsilon, actions, stateHeader, overlayClassName, className,
}: QTableModalProps) {
  return (
    <VisualizerModal
      isOpen={isOpen}
      onClose={onClose}
      title="Q-Table Visualizer"
      overlayClassName={overlayClassName}
      className={className}
      headerRight={
        <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
          <span>States: <strong className="text-white">{entries.length}</strong></span>
          <span>ε: <strong className="text-white">{(epsilon * 100).toFixed(1)}%</strong></span>
        </div>
      }
    >
      <QTableContent entries={entries} actions={actions} stateHeader={stateHeader} />
    </VisualizerModal>
  );
}

export default QTableModal;
