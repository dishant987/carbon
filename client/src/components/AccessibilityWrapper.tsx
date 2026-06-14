import { useRef, useState, useEffect } from 'react';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps the application with accessibility infrastructure:
 * - Skip-to-content link for keyboard users
 * - aria-live regions for dynamic content announcements
 * - Global ID for the main content area
 */
export function AccessibilityWrapper({ children }: AccessibilityWrapperProps) {
  const [skipVisible, setSkipVisible] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setSkipVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Skip to main content — visible only on focus for keyboard users */}
      <a
        href="#main-content"
        className={`
          sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
          focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
          focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring
          ${skipVisible ? 'not-sr-only' : 'sr-only'}
        `}
        onBlur={() => setSkipVisible(false)}
      >
        Skip to main content
      </a>

      {/* aria-live region for screen reader announcements */}
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" role="status" />

      {children}
    </>
  );
}
