"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export function Timeline({ data }: { data: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) setHeight(ref.current.getBoundingClientRect().height);
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full font-sans" ref={containerRef}>
      <div ref={ref} className="relative max-w-4xl mx-auto pb-10">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-8 md:pt-12 md:gap-8">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-28 self-start max-w-xs md:w-56">
              <div className="h-8 w-8 absolute left-2 md:left-2 rounded-full bg-background flex items-center justify-center border border-border shadow-xs">
                <div className="h-2.5 w-2.5 rounded-full bg-primary/70 border border-primary/20" />
              </div>
              <h3 className="hidden md:block text-sm md:text-base md:pl-14 font-bold text-foreground">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-14 pr-2 md:pl-0 w-full">
              <h3 className="md:hidden block text-sm mb-2 font-bold text-foreground">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{ height: height + "px" }}
          className="absolute left-6 md:left-6 top-3 overflow-hidden w-[2px] bg-gradient-to-b from-transparent via-border to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-primary via-primary/60 to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

export default Timeline;
