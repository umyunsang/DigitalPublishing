// 섹션 순서 기반 스냅 네비게이션. scrollTo는 호출부(Lenis/native)가 주입.
export function createSnap({ order, scrollTo, onChange = () => {} }) {
  let index = 0;
  const clamp = (i) => Math.max(0, Math.min(order.length - 1, i));
  const apply = () => { const id = order[index]; scrollTo(id); onChange(id, index); return id; };
  return {
    go(intent) { index = clamp(index + (intent === "next" ? 1 : -1)); return apply(); },
    jump(id) { const i = order.indexOf(id); if (i >= 0) { index = i; return apply(); } },
    current: () => order[index],
    index: () => index,
  };
}
