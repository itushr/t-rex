import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeCardProps {
  title?: string;
  code: string;
  isCommand?: boolean;
}

export function CodeCard({ title = "Terminal", code, isCommand = false }: CodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full bg-[#0a0a0b] border border-neutral-800 rounded-xl overflow-hidden shadow-md my-2">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-[#121214]">
        <span className="font-mono text-xs text-neutral-400 font-medium">{title}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">
        {isCommand ? `$ ${code}` : code}
      </pre>
    </div>
  );
}

export default CodeCard;
