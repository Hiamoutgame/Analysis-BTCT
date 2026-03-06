"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const padTime = (value: number) => value.toString().padStart(2, "0");

export function useTimeTracker(initialSeconds = 5048) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [isRunning]);

  const formattedTime = useMemo(() => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${padTime(hours)}:${padTime(minutes)}:${padTime(secs)}`;
  }, [seconds]);

  const toggle = useCallback(() => {
    setIsRunning((current) => !current);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  return {
    formattedTime,
    isRunning,
    stop,
    toggle,
  };
}
