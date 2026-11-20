import { Play, Terminal } from "lucide-react";

interface CTAProps {
  onSetupClick: () => void;
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

export function CTA({ onSetupClick }: CTAProps) {
  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center pt-24 pb-32">
      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-16 sm:gap-6 z-10 w-full">
        {/* Try Web */}
        <div className="relative flex flex-col items-center">
          <div className="sm:absolute sm:-top-28 sm:-left-36 md:-left-44 w-48 md:w-56 pointer-events-none flex flex-col sm:items-end items-center mb-1 sm:mb-0">
            <span className="text-base sm:text-lg font-handwriting text-foreground/80 tracking-wide text-center sm:text-right leading-tight select-none">
              plays cloned version<br className="hidden sm:block" /> games in website
            </span>
            <ArrowSvg className="w-14 h-20 text-foreground/60 mt-1 transform scale-x-[-1] -rotate-6 sm:-rotate-12 translate-x-2 sm:translate-x-6" />
          </div>
          <a
            href="/try-web"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-primary-foreground" />
            <span>Try Web</span>
          </a>
        </div>

        {/* Setup */}
        <div className="relative flex flex-col items-center">
          <div className="sm:absolute sm:-top-28 sm:-right-36 md:-right-44 w-48 md:w-56 pointer-events-none flex flex-col sm:items-start items-center mb-1 sm:mb-0">
            <span className="text-base sm:text-lg font-handwriting text-foreground/80 tracking-wide text-center sm:text-left leading-tight select-none">
              plays official games<br className="hidden sm:block" /> through automation
            </span>
            <ArrowSvg className="w-14 h-20 text-foreground/60 mt-1 transform rotate-6 sm:rotate-12 -translate-x-2 sm:-translate-x-6" />
          </div>
          <button
            onClick={onSetupClick}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted/50 transition-colors shadow-2xs cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span>Setup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
