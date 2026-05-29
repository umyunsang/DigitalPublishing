export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () =>
  window.matchMedia("(pointer: coarse)").matches;

export const cappedDPR = (max = 2) =>
  Math.min(window.devicePixelRatio || 1, max);

// 400% 확대 근사: 레이아웃 뷰포트가 매우 좁아지면 reflow 모드로 본다.
export const isReflow = () => window.innerWidth < 480;
