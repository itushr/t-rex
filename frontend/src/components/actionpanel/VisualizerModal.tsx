import { ReactNode } from "react";
import { Cpu } from "lucide-react";
import { ActionPanelModal } from "./ActionPanelModal";

export interface VisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  maxWidth?: string;
  overlayClassName?: string;
  className?: string;
  children: ReactNode;
}

export function VisualizerModal({
  isOpen, onClose, title = "Visualizer", icon = <Cpu className="size-4 text-emerald-400" />,
  headerRight, maxWidth = "max-w-2xl", overlayClassName, className, children,
}: VisualizerModalProps) {
  return (
    <ActionPanelModal
      isOpen={isOpen} onClose={onClose} title={title} icon={icon}
      headerRight={headerRight} maxWidth={maxWidth} overlayClassName={overlayClassName} className={className}
      footer={
        <div className="flex justify-end px-5 py-3">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 cursor-pointer">
            Close
          </button>
        </div>
      }
    >
      {children}
    </ActionPanelModal>
  );
}

export default VisualizerModal;
