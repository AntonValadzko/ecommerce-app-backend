'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/format';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}

export function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: PriceRangeSliderProps) {
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);

  useEffect(() => {
    setLocalMin(valueMin);
    setLocalMax(valueMax);
  }, [valueMin, valueMax]);

  const range = max - min || 1;
  const minPercent = ((localMin - min) / range) * 100;
  const maxPercent = ((localMax - min) / range) * 100;

  function commit() {
    const lo = Math.min(localMin, localMax);
    const hi = Math.max(localMin, localMax);
    onChange(lo, hi);
  }

  return (
    <div className="space-y-4">
      <div className="relative h-2 rounded-full bg-slate-200">
        <div
          className="absolute h-full rounded-full bg-brand-500"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={localMin}
          onChange={(e) => setLocalMin(Number(e.target.value))}
          onMouseUp={commit}
          onTouchEnd={commit}
          className="pointer-events-none absolute h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={localMax}
          onChange={(e) => setLocalMax(Number(e.target.value))}
          onMouseUp={commit}
          onTouchEnd={commit}
          className="pointer-events-none absolute h-2 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600"
        />
      </div>
      <div className="flex justify-between text-sm text-slate-600">
        <span>{formatPrice(localMin)}</span>
        <span>{formatPrice(localMax)}</span>
      </div>
    </div>
  );
}
