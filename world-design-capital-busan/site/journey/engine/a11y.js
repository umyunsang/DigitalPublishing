// 진행 인디케이터 렌더 + aria-current + 키보드 네비.
export function initA11y({ order, onGo, onJump }) {
  const list = document.getElementById("progress-list");
  list.innerHTML = order.map((id, i) =>
    `<li data-target="${id}" ${i === 0 ? 'aria-current="true"' : ""}></li>`).join("");

  function setCurrent(id) {
    for (const li of list.children)
      li.setAttribute("aria-current", String(li.dataset.target === id));
    const sec = document.getElementById(id);
    if (sec) sec.setAttribute("tabindex", "-1");
  }

  document.addEventListener("keydown", (e) => {
    if (["ArrowDown","PageDown"].includes(e.key)) { e.preventDefault(); onGo("next"); }
    else if (["ArrowUp","PageUp"].includes(e.key)) { e.preventDefault(); onGo("prev"); }
    else if (e.key === "Home") { e.preventDefault(); onJump(order[0]); }
    else if (e.key === "End") { e.preventDefault(); onJump(order[order.length - 1]); }
  });

  return { setCurrent };
}
