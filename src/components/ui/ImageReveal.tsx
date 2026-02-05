'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

export type AnimationType = 
  | 'crossfade' 
  | 'wipe-left' 
  | 'wipe-right' 
  | 'wipe-up' 
  | 'wipe-down'
  | 'circle-expand'
  | 'paint-brush';

interface ImageRevealProps {
  /** Source for the stroke/outline version */
  strokeSrc: string;
  /** Source for the colored/filled version */
  coloredSrc: string;
  /** Alt text for accessibility */
  alt: string;
  /** Width of the images (used for aspect ratio) */
  width: number;
  /** Height of the images (used for aspect ratio) */
  height: number;
  /** Animation type */
  animation?: AnimationType;
  /** Duration in milliseconds */
  duration?: number;
  /** Whether to auto-play on mount */
  autoPlay?: boolean;
  /** Delay before auto-play starts (ms) */
  autoPlayDelay?: number;
  /** Whether the animation should loop */
  loop?: boolean;
  /** Pause between loops (ms) */
  loopPause?: number;
  /** Additional className */
  className?: string;
  /** Trigger animation on scroll into view */
  triggerOnScroll?: boolean;
  /** Object fit mode for images */
  objectFit?: 'contain' | 'cover';
  /** Use fill mode for responsive sizing (container controls size) */
  fill?: boolean;
  /** Responsive sizes attribute for Next.js Image optimization */
  sizes?: string;
}

export function ImageReveal({
  strokeSrc,
  coloredSrc,
  alt,
  width,
  height,
  animation = 'crossfade',
  duration = 1500,
  autoPlay = true,
  autoPlayDelay = 500,
  loop = false,
  loopPause = 2000,
  className = '',
  triggerOnScroll = false,
  objectFit = 'contain',
  fill = false,
  sizes,
}: ImageRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll trigger
  useEffect(() => {
    if (!triggerOnScroll || hasTriggered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggered) {
            setHasTriggered(true);
            setTimeout(() => setIsRevealed(true), autoPlayDelay);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [triggerOnScroll, hasTriggered, autoPlayDelay]);

  // Handle auto-play
  useEffect(() => {
    if (triggerOnScroll || !autoPlay) return;

    const timer = setTimeout(() => setIsRevealed(true), autoPlayDelay);
    return () => clearTimeout(timer);
  }, [autoPlay, autoPlayDelay, triggerOnScroll]);

  // Handle looping
  useEffect(() => {
    if (!loop || !isRevealed) return;

    const timer = setTimeout(() => {
      setIsRevealed(false);
      setTimeout(() => setIsRevealed(true), loopPause);
    }, duration + loopPause);

    return () => clearTimeout(timer);
  }, [loop, isRevealed, duration, loopPause]);

  const getClipPath = () => {
    switch (animation) {
      case 'wipe-left':
        return isRevealed ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)';
      case 'wipe-right':
        return isRevealed ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)';
      case 'wipe-up':
        return isRevealed ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)';
      case 'wipe-down':
        return isRevealed ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)';
      case 'circle-expand':
        return isRevealed 
          ? 'circle(150% at 50% 50%)' 
          : 'circle(0% at 50% 50%)';
      default:
        return undefined;
    }
  };

  const handleClick = () => {
    setIsRevealed(!isRevealed);
  };

  const clipPath = getClipPath();
  const isCrossfade = animation === 'crossfade';
  const isPaintBrush = animation === 'paint-brush';
  const objectFitClass = objectFit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      style={fill ? undefined : { width, height }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      aria-label={`${alt} - Click to ${isRevealed ? 'hide' : 'reveal'} colors`}
    >
      {/* Stroke/outline version (base layer) */}
      <Image
        src={strokeSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={fill ? sizes : undefined}
        className={`absolute inset-0 w-full h-full ${objectFitClass}`}
        priority
      />

      {/* Colored version (reveal layer) */}
      {isPaintBrush ? (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            maskImage: isRevealed 
              ? 'linear-gradient(135deg, black 0%, black 100%)'
              : 'linear-gradient(135deg, black 0%, transparent 0%)',
            WebkitMaskImage: isRevealed 
              ? 'linear-gradient(135deg, black 0%, black 100%)'
              : 'linear-gradient(135deg, black 0%, transparent 0%)',
            maskSize: '400% 400%',
            WebkitMaskSize: '400% 400%',
            maskPosition: isRevealed ? '100% 100%' : '0% 0%',
            WebkitMaskPosition: isRevealed ? '100% 100%' : '0% 0%',
            transition: `mask-position ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-mask-position ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          <Image
            src={coloredSrc}
            alt=""
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            sizes={fill ? sizes : undefined}
            className={`w-full h-full ${objectFitClass}`}
            priority
          />
        </div>
      ) : (
        <Image
          src={coloredSrc}
          alt=""
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={fill ? sizes : undefined}
          className={`absolute inset-0 w-full h-full ${objectFitClass}`}
          style={{
            opacity: isCrossfade ? (isRevealed ? 1 : 0) : 1,
            clipPath: clipPath,
            WebkitClipPath: clipPath,
            transition: isCrossfade
              ? `opacity ${duration}ms ease-in-out`
              : `clip-path ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
          priority
        />
      )}
    </div>
  );
}

/**
 * A more advanced version that reveals colors following mouse movement
 */
export function ImageRevealInteractive({
  strokeSrc,
  coloredSrc,
  alt,
  width,
  height,
  brushSize = 100,
  className = '',
}: {
  strokeSrc: string;
  coloredSrc: string;
  alt: string;
  width: number;
  height: number;
  brushSize?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const maskLayerRef = useRef<HTMLDivElement>(null);
  const isRevealingRef = useRef(false);
  const [, forceUpdate] = useState(0); // Only for button clicks

  // Update mask directly via DOM (no React re-render)
  const updateMaskDirect = useCallback(() => {
    const canvas = canvasRef.current;
    const maskLayer = maskLayerRef.current;
    if (canvas && maskLayer) {
      const dataUrl = canvas.toDataURL();
      maskLayer.style.maskImage = `url(${dataUrl})`;
      maskLayer.style.webkitMaskImage = `url(${dataUrl})`;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize with black (hidden)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    // Update mask after initialization
    updateMaskDirect();
  }, [width, height, updateMaskDirect]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isRevealingRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;

    // "Erase" to reveal - use destination-out
    ctx.globalCompositeOperation = 'destination-out';
    
    // Create soft brush effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Update mask directly (no React re-render)
    updateMaskDirect();
  };

  const handlePointerDown = () => { isRevealingRef.current = true; };
  const handlePointerUp = () => { isRevealingRef.current = false; };
  const handlePointerLeave = () => { isRevealingRef.current = false; };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    updateMaskDirect();
    forceUpdate(n => n + 1); // Trigger re-render for button state if needed
  };

  const revealAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    
    updateMaskDirect();
    forceUpdate(n => n + 1); // Trigger re-render for button state if needed
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative cursor-crosshair touch-none select-none"
        style={{ width, height }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
      >
        {/* Colored version (base) */}
        <Image
          src={coloredSrc}
          alt={alt}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full object-contain"
          priority
        />

        {/* Stroke version with canvas mask */}
        <div
          ref={maskLayerRef}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={strokeSrc}
            alt=""
            width={width}
            height={height}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* Hidden canvas for mask generation */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-0"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-4 justify-center">
        <button
          onClick={resetCanvas}
          className="px-4 py-2 text-sm font-medium bg-grey-100 hover:bg-grey-200 rounded-md transition-colors"
        >
          Reset
        </button>
        <button
          onClick={revealAll}
          className="px-4 py-2 text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary-hover rounded-md transition-colors"
        >
          Reveal All
        </button>
      </div>
    </div>
  );
}
