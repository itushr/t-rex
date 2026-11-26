import { ReactNode, useState, useRef, useEffect, PointerEvent } from "react";
import { X } from "lucide-react";

export interface ActionPanelModalProps {
  isOpen: boolean; onClose: () => void; title: string;
  icon?: ReactNode; headerRight?: ReactNode; maxWidth?: string;
  overlayClassName?: string; className?: string; children: ReactNode; footer?: ReactNode;
}

function DragTab({ onPointerDown }: { onPointerDown: (e: PointerEvent) => void }) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute -left-5 top-7 w-5 h-16 bg-[#0f0f11] border-l border-t border-b border-neutral-700/80 rounded-l-md flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none hover:bg-neutral-800 transition-colors shadow-lg z-10"
      title="Drag to move"
    >
      <div className="grid grid-cols-2 gap-x-1 gap-y-1 p-0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="size-1 rounded-full bg-neutral-500/80" />
        ))}
      </div>
    </div>
  );
}

export function ActionPanelModal({
  isOpen, onClose, title, icon, headerRight,
  maxWidth = "max-w-md", className, children, footer,
}: ActionPanelModalProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null), offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => { if (isOpen) setPos(null); }, [isOpen]);
  if (!isOpen) return null;

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    const onMove = (ev: globalThis.PointerEvent) => {
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 80, ev.clientX - offsetRef.current.x)),
        y: Math.max(10, Math.min(window.innerHeight - 80, ev.clientY - offsetRef.current.y)),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const boxCard = className ?? "bg-[#0f0f11] text-white border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden";
  const posStyle = pos ? { position: "fixed" as const, left: `${pos.x}px`, top: `${pos.y}px`, zIndex: 40, transform: "none", bottom: "auto" } : undefined;
  const containerClass = pos ? `fixed z-40 w-full ${maxWidth} pointer-events-auto` : `fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-full ${maxWidth} pointer-events-auto`;

  return (
    <div ref={cardRef} style={posStyle} className={containerClass}>
      <DragTab onPointerDown={onPointerDown} />
      <div className={boxCard}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 select-none">
          <div className="flex items-center gap-2">{icon}<h3 className="font-semibold text-sm tracking-wide">{title}</h3></div>
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            {headerRight}
            <button type="button" onClick={onClose} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><X className="size-4" /></button>
          </div>
        </div>
        <div>{children}</div>
        {footer && <div className="border-t border-neutral-800 bg-[#09090b]">{footer}</div>}
      </div>
    </div>
  );
}

export default ActionPanelModal;
