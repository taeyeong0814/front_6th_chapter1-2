/**
 * 효율적인 이벤트 관리를 위한 이벤트 위임 시스템
 */

// 이벤트 핸들러를 저장하는 WeakMap (메모리 누수 방지)
const eventMap = new WeakMap();

/**
 * 루트 요소에 이벤트 위임 리스너를 설정
 * @param {HTMLElement} root - 이벤트 위임을 설정할 루트 요소
 */
export function setupEventListeners(root) {
  // 클릭 이벤트 위임
  root.addEventListener("click", (e) => {
    const handlers = eventMap.get(e.target);
    if (handlers && handlers.click) {
      handlers.click(e);
    }
  });

  // 인풋 이벤트 위임
  root.addEventListener("input", (e) => {
    const handlers = eventMap.get(e.target);
    if (handlers && handlers.input) {
      handlers.input(e);
    }
  });

  // 체인지 이벤트 위임
  root.addEventListener("change", (e) => {
    const handlers = eventMap.get(e.target);
    if (handlers && handlers.change) {
      handlers.change(e);
    }
  });

  // 마우스오버 이벤트 위임 (테스트에서 사용)
  root.addEventListener("mouseover", (e) => {
    const handlers = eventMap.get(e.target);
    if (handlers && handlers.mouseover) {
      handlers.mouseover(e);
    }
  });

  // 포커스 이벤트 위임 (테스트에서 사용)
  root.addEventListener(
    "focus",
    (e) => {
      const handlers = eventMap.get(e.target);
      if (handlers && handlers.focus) {
        handlers.focus(e);
      }
    },
    true,
  ); // capture 단계에서 처리 (focus는 bubble되지 않음)

  // 키다운 이벤트 위임 (테스트에서 사용)
  root.addEventListener("keydown", (e) => {
    const handlers = eventMap.get(e.target);
    if (handlers && handlers.keydown) {
      handlers.keydown(e);
    }
  });

  // 서브밋 이벤트 위임
  root.addEventListener("submit", (e) => {
    const handlers = eventMap.get(e.target);
    if (handlers && handlers.submit) {
      handlers.submit(e);
    }
  });
}

/**
 * 특정 요소에 이벤트 핸들러를 등록 (위임 방식)
 * @param {HTMLElement} element - 이벤트를 등록할 요소
 * @param {string} eventType - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러 함수
 */
export function addEvent(element, eventType, handler) {
  // WeakMap에 해당 요소의 핸들러 저장
  if (!eventMap.has(element)) {
    eventMap.set(element, {});
  }
  eventMap.get(element)[eventType] = handler;
}

/**
 * 특정 요소의 이벤트 핸들러를 제거 (위임 방식)
 * @param {HTMLElement} element - 이벤트를 제거할 요소
 * @param {string} eventType - 이벤트 타입
 * @param {Function} handler - 제거할 핸들러 함수 (위임 방식에서는 미사용)
 */
// eslint-disable-next-line no-unused-vars
export function removeEvent(element, eventType, handler) {
  const handlers = eventMap.get(element);
  if (handlers && handlers[eventType]) {
    delete handlers[eventType];

    // 해당 요소에 핸들러가 더 이상 없으면 WeakMap에서 제거
    if (Object.keys(handlers).length === 0) {
      eventMap.delete(element);
    }
  }
}
