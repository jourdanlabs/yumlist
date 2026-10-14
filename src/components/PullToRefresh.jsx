import React, { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const THRESHOLD = 70;

function findScrollableAncestor(target) {
  let el = target;
  while (el && el !== document.body && el !== document.documentElement) {
    const style = window.getComputedStyle(el);
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const scrollContainer = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (refreshing) return;
    const container = findScrollableAncestor(e.target);
    scrollContainer.current = container;
    const scrollTop = container ? container.scrollTop : window.scrollY;
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const container = scrollContainer.current;
    const scrollTop = container ? container.scrollTop : window.scrollY;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0 && scrollTop <= 0) {
      setPullDistance(Math.min(diff * 0.5, THRESHOLD * 1.5));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative z-20 flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance }}
      >
        <RefreshCw
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            (refreshing || pullDistance > THRESHOLD * 0.8) && "animate-spin"
          )}
        />
      </div>
      {children}
    </div>
  );
}