import React, { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children, className = "" }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const threshold = 80;
  const maxPull = 120;

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, maxPull);
      setPullDistance(distance);
    }
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= threshold && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh error:", error);
      }
      setIsRefreshing(false);
    }
    
    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: pullDistance > 0 ? 'none' : 'auto' }}
    >
      {/* Indicador de Pull */}
      <div 
        className="flex items-center justify-center overflow-hidden transition-all duration-200 select-none"
        style={{ 
          height: isRefreshing ? 50 : pullDistance,
          opacity: isRefreshing ? 1 : progress
        }}
      >
        <div className={`flex items-center gap-2 ${shouldTrigger || isRefreshing ? 'text-[#6B4423] dark:text-[#C9A961]' : 'text-[#8B7355] dark:text-gray-400'}`}>
          <RefreshCw 
            className={`w-5 h-5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ 
              transform: isRefreshing ? 'none' : `rotate(${progress * 180}deg)` 
            }}
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Atualizando...' : shouldTrigger ? 'Solte para atualizar' : 'Puxe para atualizar'}
          </span>
        </div>
      </div>
      
      {children}
    </div>
  );
}