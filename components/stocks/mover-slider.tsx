"use client";

import { Children, useEffect, useMemo, useRef, useState } from "react";

type MoverSliderTab = {
  id: string;
  label: string;
};

type MoverSliderProps = {
  tabs: MoverSliderTab[];
  children: React.ReactNode;
};

export function MoverSlider({ tabs, children }: MoverSliderProps) {
  const slides = useMemo(() => Children.toArray(children), [children]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedSlideCount = Math.min(tabs.length, slides.length);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    function updateSelectedIndex() {
      const currentContainer = scrollContainerRef.current;

      if (!currentContainer) {
        return;
      }

      const childElements = Array.from(
        currentContainer.children,
      ) as HTMLElement[];

      if (childElements.length === 0) {
        return;
      }

      const nextIndex = childElements.reduce((closestIndex, element, index) => {
        const currentDistance = Math.abs(
          element.offsetLeft - currentContainer.scrollLeft,
        );
        const closestDistance = Math.abs(
          childElements[closestIndex].offsetLeft - currentContainer.scrollLeft,
        );

        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);

      setSelectedIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex,
      );
    }

    updateSelectedIndex();
    container.addEventListener("scroll", updateSelectedIndex, {
      passive: true,
    });
    window.addEventListener("resize", updateSelectedIndex);

    return () => {
      container.removeEventListener("scroll", updateSelectedIndex);
      window.removeEventListener("resize", updateSelectedIndex);
    };
  }, []);

  function handleSelect(index: number) {
    setSelectedIndex(index);

    const container = scrollContainerRef.current;
    const slide = container?.children[index] as HTMLElement | undefined;

    if (!container || !slide) {
      return;
    }

    slide.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  if (selectedSlideCount === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden lg:hidden">
        <div className="flex snap-x snap-mandatory gap-1.5 overflow-x-auto px-1 pb-1">
          {tabs.slice(0, selectedSlideCount).map((tab, index) => {
            const isSelected = index === selectedIndex;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelect(index)}
                aria-pressed={isSelected}
                className={[
                  "snap-start shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
                  isSelected
                    ? "border-primary/35 bg-primary/8 text-primary"
                    : "border-base-300/70 bg-base-100/80 text-base-content/72 hover:border-primary/20",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible"
      >
        {slides.slice(0, selectedSlideCount).map((slide, index) => (
          <div
            key={tabs[index]?.id ?? index}
            className="min-w-full snap-start lg:min-w-0"
          >
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
}
