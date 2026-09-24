"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  LAST_MINUTE_INTERVAL_MS,
  LAST_MINUTE_SLIDES,
} from "@/lib/last-minute-slides";

type Props = {
  className?: string;
  label?: string;
};

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function LastMinuteBanner({
  className = "",
  label = "Last minute",
}: Props) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % LAST_MINUTE_SLIDES.length);
    }, LAST_MINUTE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <Link
      href="/last-minute"
      className={`relative isolate block h-10 min-h-10 w-full min-w-0 overflow-hidden rounded-xl bg-[var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:h-11 ${className}`}
      aria-label={`${label} — apri pagina Last minute`}
    >
      {LAST_MINUTE_SLIDES.map((slide, i) => {
        const active = i === index;
        return (
          <span
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              active ? "opacity-100" : "opacity-0"
            } ${reduceMotion ? "duration-0" : ""}`}
            aria-hidden={!active}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 420px"
              className="object-cover"
              priority={i === 0}
            />
            <span
              className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/10"
              aria-hidden
            />
            <span className="absolute inset-y-0 left-3 flex items-center text-sm font-bold tracking-wide text-white drop-shadow-sm sm:left-4 sm:text-[15px]">
              {label}
            </span>
          </span>
        );
      })}
    </Link>
  );
}
