// 섹션 레지스트리 + 생명주기. factory는 동기 객체 또는 async 로더를 반환.
export function createRegistry() {
  const factories = new Map();   // name -> factory
  const instances = new Map();   // name -> module instance
  const active = new Set();

  async function ensure(name) {
    if (instances.has(name)) return instances.get(name);
    const factory = factories.get(name);
    if (!factory) throw new Error(`Unknown section: ${name}`);
    const inst = await factory();           // 실패 시 throw → 호출부에서 폴백
    if (inst && typeof inst.init === "function") inst.init(
      document.getElementById(name));
    instances.set(name, inst);
    return inst;
  }

  return {
    register(name, factory) { factories.set(name, factory); },
    async activate(name) {
      const inst = await ensure(name);
      if (inst && typeof inst.enter === "function") inst.enter();
      active.add(name);
      return inst;
    },
    deactivate(name) {
      const inst = instances.get(name);
      if (inst && typeof inst.leave === "function") inst.leave();
      active.delete(name);
    },
    dispose(name) {
      const inst = instances.get(name);
      if (inst && typeof inst.dispose === "function") inst.dispose();
      instances.delete(name);
    },
    has: (name) => factories.has(name),
  };
}
