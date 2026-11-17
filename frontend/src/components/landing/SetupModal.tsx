import { useState } from "react";
import { Terminal, Copy, Check, X, ExternalLink } from "lucide-react";

export function SetupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!open) return null;

  const commands = [
    { title: "1. Clone repository", cmd: "git clone https://github.com/itushr/t-rex.git" },
    { title: "2. Install dependencies", cmd: "cd t-rex && pip install -r backend/driver/requirements.txt" },
    { title: "3. Launch driver orchestrator", cmd: "python backend/driver/main.py" },
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 text-zinc-900 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-5 h-5 text-zinc-800" />
          <h2 className="text-base font-bold tracking-tight">Local Driver Setup</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-6">
          Record Chrome dinosaur gameplay via Chrome DevTools Protocol (CDP) and train models locally.
        </p>

        <div className="space-y-3 mb-6">
          {commands.map((c, i) => (
            <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                <span>{c.title}</span>
                <button
                  onClick={() => handleCopy(c.cmd, i)}
                  className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  {copiedIdx === i ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIdx === i ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <code className="text-xs font-mono text-zinc-800 block overflow-x-auto selection:bg-zinc-200">
                {c.cmd}
              </code>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <a
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 transition-colors"
          >
            Open Web Dashboard <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
export default SetupModal;
