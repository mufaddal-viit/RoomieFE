import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowRight, Check, Loader2, X } from 'lucide-react';

import { cn } from '@/lib/utils';

const SLIDE_PADDING = 4;
const COMPLETE_THRESHOLD = 0.92;
const MAGNET_START = 0.85;
const KEY_STEP = 0.05;

type SlideSubmitButtonProps = {
  onComplete: () => void | Promise<void>;
  label?: string;
  loadingLabel?: string;
  completedLabel?: string;
  errorLabel?: string;
  disabledLabel?: string;
  disabled?: boolean;
  loading?: boolean; // controlled loading (optional)
  className?: string;
};

type Status = 'idle' | 'dragging' | 'submitting' | 'success' | 'error';

const SlideSubmitButton = ({
  onComplete,
  label = 'Slide to submit',
  loadingLabel = 'Submitting...',
  completedLabel = 'Submitted',
  errorLabel = 'Try again',
  disabledLabel,
  disabled = false,
  loading = false,
  className,
}: SlideSubmitButtonProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);

  const progressRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const submittingRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [dimensions, setDimensions] = useState({ track: 0, handle: 0 });

  const isDisabled = disabled || loading;
  const isDragging = status === 'dragging';
  const isSubmitting = status === 'submitting' || loading;
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const setProgressSafe = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    progressRef.current = clamped;
    setProgress(clamped);
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return;

    const update = () => {
      setDimensions({
        track: track.clientWidth,
        handle: handle.clientWidth,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    observer.observe(handle);

    return () => observer.disconnect();
  }, []);

  const maxOffset = useMemo(() => {
    return Math.max(0, dimensions.track - dimensions.handle - SLIDE_PADDING * 2);
  }, [dimensions.handle, dimensions.track]);

  const applyMagnet = useCallback((raw: number) => {
    // Make it slightly forgiving near the end.
    if (raw >= COMPLETE_THRESHOLD) return 1;
    if (raw <= MAGNET_START) return raw;

    // Ease-in pull from MAGNET_START -> COMPLETE_THRESHOLD
    const t = (raw - MAGNET_START) / (COMPLETE_THRESHOLD - MAGNET_START);
    const eased = t * t; // gentle pull
    const boosted = MAGNET_START + eased * (COMPLETE_THRESHOLD - MAGNET_START);
    return boosted;
  }, []);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      const handle = handleRef.current;
      if (!track || !handle) return;

      const rect = track.getBoundingClientRect();
      const handleWidth = handle.offsetWidth;

      const leftEdge = rect.left + SLIDE_PADDING + handleWidth / 2;
      const rightEdge = rect.right - SLIDE_PADDING - handleWidth / 2;
      const denom = rightEdge - leftEdge;

      if (denom <= 0) {
        setProgressSafe(0);
        return;
      }

      const raw = (clientX - leftEdge) / denom;
      const next = applyMagnet(raw);
      setProgressSafe(next);
    },
    [applyMagnet, setProgressSafe],
  );

  const commit = useCallback(async () => {
    if (isDisabled || submittingRef.current) return;

    // lock UI
    submittingRef.current = true;
    setStatus('submitting');
    setProgressSafe(1);

    try {
      await onComplete();
      setStatus('success');

      // show success moment, then reset
      window.setTimeout(() => {
        submittingRef.current = false;
        if (!loading) {
          setStatus('idle');
          setProgressSafe(0);
        }
      }, 850);
    } catch {
      setStatus('error');

      // show error moment, then reset
      window.setTimeout(() => {
        submittingRef.current = false;
        if (!loading) {
          setStatus('idle');
          setProgressSafe(0);
        }
      }, 950);
    }
  }, [isDisabled, loading, onComplete, setProgressSafe]);

  // Keep status aligned with controlled loading, if used
  useEffect(() => {
    if (loading) {
      setStatus('submitting');
      setProgressSafe(1);
      return;
    }

    // if loading is turned off externally, reset unless user is dragging
    if (!loading && !isDragging && status === 'submitting' && !submittingRef.current) {
      setStatus('idle');
      setProgressSafe(0);
    }
  }, [isDragging, loading, setProgressSafe, status]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: globalThis.PointerEvent) => {
      updateFromClientX(event.clientX);
    };

    const handleRelease = () => {
      setStatus('idle');

      // release pointer capture if possible
      const pid = pointerIdRef.current;
      pointerIdRef.current = null;
      try {
        if (pid != null) handleRef.current?.releasePointerCapture(pid);
      } catch {
        // ignore
      }

      if (isDisabled || isSubmitting) {
        setProgressSafe(0);
        return;
      }

      if (progressRef.current >= COMPLETE_THRESHOLD) {
        void commit();
        return;
      }

      setProgressSafe(0);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleRelease);
    window.addEventListener('pointercancel', handleRelease);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleRelease);
      window.removeEventListener('pointercancel', handleRelease);
    };
  }, [commit, isDisabled, isDragging, isSubmitting, setProgressSafe, updateFromClientX]);

  useEffect(() => {
    // If disabled becomes true (and user isn't dragging), reset
    if (!isDragging && disabled) {
      setStatus('idle');
      setProgressSafe(0);
    }
  }, [disabled, isDragging, setProgressSafe]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (isDisabled || isSubmitting) return;
    event.preventDefault();
    setStatus('dragging');
    pointerIdRef.current = event.pointerId;
    handleRef.current?.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // allow clicking/dragging from the track
    if (isDisabled || isSubmitting) return;

    // If user clicks the handle, button handler will run.
    // Otherwise, start dragging from track.
    const handle = handleRef.current;
    if (handle && event.target === handle) return;

    event.preventDefault();
    setStatus('dragging');
    pointerIdRef.current = event.pointerId;

    // capture on handle (more consistent)
    handleRef.current?.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled || isSubmitting) return;

    const key = event.key;

    if (key === 'ArrowRight') {
      event.preventDefault();
      setProgressSafe(applyMagnet(progressRef.current + KEY_STEP));
      return;
    }
    if (key === 'ArrowLeft') {
      event.preventDefault();
      setProgressSafe(Math.max(0, progressRef.current - KEY_STEP));
      return;
    }
    if (key === 'Home') {
      event.preventDefault();
      setProgressSafe(0);
      return;
    }
    if (key === 'End') {
      event.preventDefault();
      setProgressSafe(1);
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      // Complete immediately via keyboard (common pattern for "slide to confirm")
      void commit();
    }
  };

  const handleOffset = maxOffset * progress;

  // Fill should grow with progress (not just match handle width)
  const fillWidthPx = Math.min(
    dimensions.track - SLIDE_PADDING * 2,
    dimensions.handle + handleOffset,
  );

  const allowTransitions = !isDragging && !isSubmitting;

  const flowWidth = Math.max(88, Math.min(160, dimensions.track * 0.5));
  const flowDistance = Math.max(0, dimensions.track - flowWidth - SLIDE_PADDING * 2);
  const showFlow = !isDragging && !isSubmitting && !isDisabled && flowDistance > 0;

  const flowStyle = {
    width: `${flowWidth}px`,
    animation: 'slide-submit-flow 2.6s ease-in-out infinite',
    '--slide-flow-distance': `${flowDistance}px`,
  } as CSSProperties;

  const handleStyle = { transform: `translateX(${handleOffset}px)` };
  const fillStyle = {
    width: `${fillWidthPx}px`,
  };

  const shownLabel = (() => {
    if (isDisabled && disabledLabel) return disabledLabel;
    if (isSubmitting) return loadingLabel;
    if (isSuccess) return completedLabel;
    if (isError) return errorLabel;
    return label;
  })();

  const valueNow = Math.round(progress * 100);
  const valueText =
    isSuccess ? 'Submitted' : isError ? 'Error. Try again.' : `${valueNow}%`;

  return (
    <div className={cn('relative h-11 w-full select-none', className)}>
      <style>
        {`
          @keyframes slide-submit-flow {
            0% { transform: translateX(0); opacity: 0; }
            20% { opacity: 0.75; }
            100% { transform: translateX(var(--slide-flow-distance)); opacity: 0; }
          }

          @media (prefers-reduced-motion: reduce) {
            .slide-submit-anim { animation: none !important; }
            .slide-submit-trans { transition: none !important; }
          }
        `}
      </style>

      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        className={cn(
          'relative h-full w-full overflow-hidden rounded-full border border-sky-200/60 bg-white/70 shadow-[0_14px_30px_-20px_rgba(14,116,144,0.6)] backdrop-blur',
          'focus-within:ring-2 focus-within:ring-sky-400/60 focus-within:ring-offset-0',
          (isDisabled || isSubmitting) && 'opacity-70',
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-sky-500/15" />

        {showFlow && (
          <span
            aria-hidden
            className={cn(
              'slide-submit-anim pointer-events-none absolute left-1 top-1 h-9 rounded-full bg-gradient-to-r from-transparent via-sky-400/60 to-transparent blur-[2px]',
            )}
            style={flowStyle}
          />
        )}

        <div
          className={cn(
            'absolute left-1 top-1 h-9 rounded-full bg-gradient-to-r from-sky-500/70 via-sky-400/60 to-sky-500/70 shadow-[inset_0_0_10px_rgba(56,189,248,0.55)] ring-1 ring-white/40',
            allowTransitions && 'slide-submit-trans transition-[width] duration-300 ease-out',
          )}
          style={fillStyle}
        />

        {/* Adaptive label: slate text + white text clipped to the filled area */}
        <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          <span className="relative">
            <span className="text-slate-700">{shownLabel}</span>
            <span
              aria-hidden
              className="absolute inset-0 text-white"
              style={{
                clipPath: `inset(0 ${Math.max(
                  0,
                  dimensions.track - SLIDE_PADDING * 2 - fillWidthPx,
                )}px 0 0)`,
              }}
            >
              {shownLabel}
            </span>
          </span>
        </span>

        <button
          ref={handleRef}
          type="button"
          // ARIA slider semantics
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={valueNow}
          aria-valuetext={valueText}
          aria-disabled={isDisabled || isSubmitting}
          disabled={isDisabled || isSubmitting}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          className={cn(
            'absolute left-1 top-1 flex h-9 w-9 items-center justify-center rounded-full text-white outline-none ring-2 ring-white/70 focus-visible:ring-2 focus-visible:ring-sky-400 touch-none',
            'shadow-lg shadow-sky-500/30',
            !isDisabled && !isSubmitting && 'bg-sky-600',
            (isDisabled || isSubmitting) && 'cursor-not-allowed bg-slate-400 shadow-none',
            !isDisabled && !isSubmitting && (isDragging ? 'cursor-grabbing' : 'cursor-grab'),
            allowTransitions && 'slide-submit-trans transition-transform duration-300 ease-out',
          )}
          style={handleStyle}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSuccess ? (
            <Check className="h-4 w-4" />
          ) : isError ? (
            <X className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export { SlideSubmitButton };
