import React, { useEffect, useRef, useState } from "react";
import { PugState } from "../../types/agent";
import { pugAudio } from "./PugAudio";

interface PugCharacterProps {
  state?: PugState;
  size?: number;
  onClick?: () => void;
  className?: string;
}

export const PugCharacter: React.FC<PugCharacterProps> = ({
  state = "idle",
  size = 40,
  onClick,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);

  // Mouse tracking for pupil movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.hypot(deltaX, deltaY);
      const maxDist = 300;
      const normDist = Math.min(dist / maxDist, 1);

      const angle = Math.atan2(deltaY, deltaX);
      const maxOffset = 3.5;

      setEyeOffset({
        x: Math.cos(angle) * normDist * maxOffset,
        y: Math.sin(angle) * normDist * maxOffset,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking
  useEffect(() => {
    let timeout: any;
    const scheduleBlink = () => {
      const delay = Math.random() * 3500 + 2000;
      timeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  const handleClick = () => {
    pugAudio.playBark();
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 300);
    onClick?.();
  };

  const renderEyes = () => {
    if (state === "done") {
      return (
        <g stroke="#1a1412" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M 27 34 Q 31 29 35 34" />
          <path d="M 45 34 Q 49 29 53 34" />
        </g>
      );
    }

    if (state === "error") {
      return (
        <g>
          <path d="M 28 31 L 34 37 M 34 31 L 28 37" stroke="#1a1412" strokeWidth="2" strokeLinecap="round" />
          <circle cx="49" cy="34" r="5" fill="#1a1412" />
          <circle cx="48" cy="33" r="1.5" fill="#ffffff" />
        </g>
      );
    }

    if (isBlinking) {
      return (
        <g stroke="#1a1412" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M 27 35 Q 31 37 35 35" />
          <path d="M 45 35 Q 49 37 53 35" />
        </g>
      );
    }

    const pupilX = state === "thinking" ? 2 : eyeOffset.x;
    const pupilY = state === "thinking" ? -2.5 : eyeOffset.y;

    return (
      <g>
        <circle cx="31" cy="34" r="5.5" fill="#fdfcf8" stroke="#1c1410" strokeWidth="1" />
        <circle cx={31 + pupilX} cy={34 + pupilY} r="3.2" fill="#15100d" />
        <circle cx={31 + pupilX - 1} cy={34 + pupilY - 1} r="1.1" fill="#ffffff" />

        <circle cx="49" cy="34" r="5.5" fill="#fdfcf8" stroke="#1c1410" strokeWidth="1" />
        <circle cx={49 + pupilX} cy={34 + pupilY} r="3.2" fill="#15100d" />
        <circle cx={49 + pupilX - 1} cy={34 + pupilY - 1} r="1.1" fill="#ffffff" />
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-transform duration-150 select-none ${
        isPoked ? "scale-90" : "hover:scale-105 active:scale-95"
      } ${className}`}
      title="Bark — Mascotte Carlin"
    >
      <svg
        viewBox="0 0 80 80"
        className={`w-full h-full drop-shadow-md ${
          state === "working" ? "animate-pulse" : state === "alert" ? "animate-bounce" : ""
        }`}
      >
        {/* Left Ear */}
        <path
          d="M 18 22 C 10 26 12 42 22 41 C 24 35 24 25 18 22 Z"
          fill="#2a1f1a"
          className="transition-transform duration-200"
        />
        {/* Right Ear */}
        <path
          d="M 62 22 C 70 26 68 42 58 41 C 56 35 56 25 62 22 Z"
          fill="#2a1f1a"
          className="transition-transform duration-200"
        />

        {/* Main Pug Head */}
        <rect
          x="16"
          y="18"
          width="48"
          height="46"
          rx="18"
          fill="#d4a373"
          stroke="#b88355"
          strokeWidth="1.5"
        />

        {/* Forehead Wrinkles */}
        <g stroke="#9c6644" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.85">
          <path d="M 33 24 Q 40 21 47 24" />
          <path d="M 35 27 Q 40 25 45 27" />
          <path d="M 38 22 L 38 29" />
          <path d="M 42 22 L 42 29" />
        </g>

        {/* Eyes */}
        {renderEyes()}

        {/* Dark Pug Muzzle */}
        <ellipse cx="40" cy="46" rx="14" ry="11" fill="#251a15" />

        {/* Nose */}
        <path
          d="M 37 42 C 37 40 43 40 43 42 C 43 44 41 45.5 40 45.5 C 39 45.5 37 44 37 42 Z"
          fill="#0f0b09"
        />
        <ellipse cx="39.2" cy="41.5" rx="0.8" ry="0.5" fill="#665248" />

        {/* Mouth and Tongue */}
        {state === "done" || state === "alert" ? (
          <g>
            <path d="M 36 47 Q 40 52 44 47" stroke="#120c09" strokeWidth="1.5" fill="#4a1515" />
            <path
              d="M 38 49 C 38 54 42 54 42 49 Z"
              fill="#ff6b8b"
              stroke="#e0486b"
              strokeWidth="0.8"
            />
          </g>
        ) : (
          <path
            d="M 36 47 Q 40 49 44 47"
            stroke="#120c09"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
};
