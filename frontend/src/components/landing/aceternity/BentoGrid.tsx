import React from "react";

export function BentoGrid({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto ${className}`}>
      {children}
    </div>
  );
}

export function BentoGridItem({
  className = "",
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl group/bento hover:shadow-lg transition-all duration-300 p-6 bg-white border border-zinc-200/90 flex flex-col justify-between ${className}`}
    >
      {header}
      <div className="group-hover/bento:translate-x-0.5 transition-transform duration-200">
        {icon}
        <div className="font-bold text-zinc-900 text-base mb-1 mt-2">{title}</div>
        <div className="text-zinc-600 text-xs leading-relaxed">{description}</div>
      </div>
    </div>
  );
}
