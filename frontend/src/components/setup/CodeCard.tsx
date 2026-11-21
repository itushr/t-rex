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
    <div className="w-full bg-[#09090b] border border-neutral-800 rounded-xl overflow-hidden shadow-xs my-3">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/80 bg-[#09090b]">
        <span className="font-mono text-xs text-neutral-400 font-normal">{title}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1 rounded text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          aria-label={`Copy ${title} snippet`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-4 sm:p-5 overflow-x-auto select-text">
        {isCommand ? (
          <div className="flex items-center font-mono text-xs sm:text-sm text-neutral-200 whitespace-pre">
            <span className="text-neutral-500 select-none mr-2">$</span>
            <span>{code}</span>
          </div>
        ) : (
          <pre className="font-mono text-xs sm:text-sm text-neutral-200 whitespace-pre leading-relaxed">
            {code}
          </pre>
        )}
      </div>
    </div>
  );
}

export default CodeCard;
