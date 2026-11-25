import { ReactNode } from "react";
import { X } from "lucide-react";

export interface ActionPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  maxWidth?: string;
  overlayClassName?: string;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function ActionPanelModal({
  isOpen, onClose, title, icon, headerRight,
  maxWidth = "max-w-md", overlayClassName, className, children, footer,
}: ActionPanelModalProps) {
  if (!isOpen) return null;

  const overlayPos = overlayClassName ?? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4";
  const boxCard = className ?? "bg-[#0f0f11] text-white border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden scale-y-125";

  return (
    <div className={overlayPos}>
      <div className={`${boxCard} w-full ${maxWidth}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            {headerRight}
            <button type="button" onClick={onClose} className="p-1 text-neutral-400 hover:text-white cursor-pointer">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div>{children}</div>
        {footer && <div className="border-t border-neutral-800 bg-[#09090b]">{footer}</div>}
      </div>
    </div>
  );
}

export default ActionPanelModal;
