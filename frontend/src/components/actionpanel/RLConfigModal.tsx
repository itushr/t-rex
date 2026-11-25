import { useState } from "react";
import { Check } from "lucide-react";
import { ActionPanelModal } from "./ActionPanelModal";
import { QConfigContent } from "@/models/q-learning";
import type { RLConfig } from "@/types/rl";

export interface RLConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RLConfig<any>;
  onSave: (config: RLConfig<any>) => void;
  overlayClassName?: string;
  className?: string;
}

export function RLConfigModal({
  isOpen, onClose, config, onSave, overlayClassName, className,
}: RLConfigModalProps) {
  const [draft, setDraft] = useState<RLConfig<any>>(config);

  return (
    <ActionPanelModal
      isOpen={isOpen}
      onClose={onClose}
      title="Q-Learning RL Configuration"
      maxWidth="max-w-md"
      overlayClassName={overlayClassName}
      className={className}
      footer={
        <div className="flex justify-end gap-2 px-5 py-3">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:bg-neutral-800 cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={() => { onSave(draft); onClose(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 cursor-pointer">
            <Check className="size-3.5" /> Apply
          </button>
        </div>
      }
    >
      <QConfigContent draft={draft} onChangeDraft={setDraft} config={config} />
    </ActionPanelModal>
  );
}

export default RLConfigModal;
