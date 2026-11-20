import { Play, Terminal } from "lucide-react";

interface CTAProps {
  onSetupClick: () => void;
  contrast?: "default" | "high";
}

function ArrowSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 491 793" fill="none">
      <path
        d="M13.1636 768.773C3.93826 755.712 51.1212 736.857 60.1788 729.892C119.756 699.24 178.586 666.557 233.046 627.375C298.517 575.067 399.068 447.183 369.266 359.303C340.712 384.063 216.441 433.305 187.949 399.926C172.395 381.283 185.442 356.028 199.44 340.637C240.118 294.363 339.905 267.764 375.472 332.693C453.488 256.372 481.354 140.836 473.038 34.7155C474.448 24.0339 463.785 3.61997 478.329 0.0172619C482.821 -0.274729 486.515 3.17463 486.925 7.55591C501.542 128.021 474.033 262.794 382.591 348.14C419.899 444.581 321.485 571.362 252.525 632.576C198.395 674.076 138.322 707.579 77.7968 738.796C59.3323 748.369 41.3863 758.94 24.3904 770.945C20.823 773.486 15.6056 772.365 13.1636 768.773ZM217.462 395.447C268.719 390.323 321.813 375.686 363.038 343.702C340.537 295.131 277.126 308.715 238.717 328.764C217.718 338.503 169.584 391.829 217.462 395.447Z"
        fill="currentColor"
      />
      <path
        d="M58.8351 791.854C39.9171 781.755 -0.846024 781.669 0.0133791 753.433C5.14252 742.599 6.79666 710.215 19.0098 708.372C38.3622 708.428 16.0846 745.611 15.8573 756.769C25.7674 770.098 76.2174 769.832 69.683 788.237C67.6876 792.247 62.7365 793.748 58.8351 791.854Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CTA({ onSetupClick, contrast = "default" }: CTAProps) {
  const isHigh = contrast === "high";
  const txtCls = isHigh ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]" : "text-foreground/80";
  const arrCls = isHigh ? "text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]" : "text-foreground/60";

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center pt-6 pb-28">
      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-24 sm:gap-6 z-10 w-full">
        {/* Try Web */}
        <div className="relative flex flex-col items-center">
          <a
            href="/try-web"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-lg cursor-pointer"
          >
            <Play className="w-4 h-4 fill-primary-foreground" />
            <span>Try Web</span>
          </a>

          <div className="sm:absolute top-10 sm:top-12 sm:-left-44 md:-left-56 w-52 md:w-60 pointer-events-none flex flex-col items-center mt-3 sm:mt-0">
            <ArrowSvg className={`w-14 sm:w-16 h-20 sm:h-24 ${arrCls} rotate-180 sm:self-end sm:mr-4`} />
            <span className={`text-base sm:text-lg font-handwriting ${txtCls} tracking-wide text-center leading-tight -mt-1 sm:-mt-2 select-none`}>
              plays cloned version<br />games in website
            </span>
          </div>
        </div>

        {/* Setup */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={onSetupClick}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted/50 transition-colors shadow-lg cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span>Setup</span>
          </button>

          <div className="sm:absolute top-10 sm:top-12 sm:-right-44 md:-right-56 w-52 md:w-60 pointer-events-none flex flex-col items-center mt-3 sm:mt-0">
            <ArrowSvg className={`w-14 sm:w-16 h-20 sm:h-24 ${arrCls} rotate-180 scale-x-[-1] sm:self-start sm:ml-4`} />
            <span className={`text-base sm:text-lg font-handwriting ${txtCls} tracking-wide text-center leading-tight -mt-1 sm:-mt-2 select-none`}>
              plays official games<br />through automation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
