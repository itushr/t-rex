import { useEffect } from "react";

interface ActionPanelShortcutsOptions {
  onToggleRecord?: () => void;
  onTogglePlayPause?: () => void;
  onToggleSound?: () => void;
  onToggleCollapse?: () => void;
  onVisualize?: () => void;
  showVisualize?: boolean;
}

export function useActionPanelShortcuts({
  onToggleRecord,
  onTogglePlayPause,
  onToggleSound,
  onToggleCollapse,
  onVisualize,
  showVisualize = false,
}: ActionPanelShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === "r") {
        e.preventDefault();
        onToggleRecord?.();
      } else if (key === "p") {
        e.preventDefault();
        onTogglePlayPause?.();
      } else if (key === "m") {
        e.preventDefault();
        onToggleSound?.();
      } else if (key === "c") {
        e.preventDefault();
        onToggleCollapse?.();
      } else if (key === "v" && showVisualize) {
        e.preventDefault();
        onVisualize?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onToggleRecord,
    onTogglePlayPause,
    onToggleSound,
    onToggleCollapse,
    onVisualize,
    showVisualize,
  ]);
}
