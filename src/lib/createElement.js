import { addEvent } from "./eventManager";

/**
 * DOM 요소에 속성을 설정하는 함수
 * @param {HTMLElement} $el - 속성을 설정할 DOM 요소
 * @param {Object|null} props - 설정할 속성들
 */

// 이 파일은 정규화된 Virtual DOM 객체를 실제 브라우저의 DOM 요소로 변환하는 역할을 합니다.

// 이 함수는 Virtual DOM의 속성(props)을 실제 DOM 요소에 적용하는 역할을 합니다.
function updateAttributes($el, props) {
  if (!props) return;

  Object.entries(props).forEach(([key, value]) => {
    // 이벤트 핸들러 처리
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
      return;
    }

    // className을 class로 변환
    if (key === "className") {
      $el.setAttribute("class", value);
      return;
    }

    // 불리언 속성 처리 (property로 설정)
    if (["checked", "selected"].includes(key)) {
      $el[key] = value;
      // checked와 selected는 DOM attribute로 설정하지 않음 (property만 사용)
      return;
    }

    // 불리언 속성 처리 (DOM attribute도 설정)
    if (["disabled", "readOnly"].includes(key)) {
      $el[key] = value;
      if (value) {
        $el.setAttribute(key, "");
      }
      return;
    }

    // 불리언 속성 처리 (일반 boolean)
    if (typeof value === "boolean") {
      if (value) {
        $el.setAttribute(key, "");
      }
      return;
    }

    // 일반 속성 설정
    $el.setAttribute(key, value);
  });
}

/**
 * 정규화된 Virtual DOM 객체를 실제 DOM 요소로 변환
 * @param {any} vNode - 변환할 Virtual DOM 노드
 * @returns {Node} 실제 DOM 노드
 */
export function createElement(vNode) {
  // Falsy 값들은 빈 텍스트 노드로 변환
  if (vNode === null || vNode === undefined || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 문자열이나 숫자는 텍스트 노드로 변환
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  // 배열이면 DocumentFragment로 변환
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      fragment.appendChild(createElement(child));
    });
    return fragment;
  }

  // 함수형 컴포넌트는 에러 발생 (정규화가 필요함)
  if (typeof vNode.type === "function") {
    throw new Error("컴포넌트는 createElement로 직접 처리할 수 없습니다. normalizeVNode를 먼저 사용하세요.");
  }

  // vNode 객체를 HTML 요소로 변환
  const $el = document.createElement(vNode.type);

  // 속성 설정
  updateAttributes($el, vNode.props);

  // 자식 요소들 추가
  if (vNode.children) {
    vNode.children.forEach((child) => {
      // falsy 값들은 완전히 건너뛰기
      if (child === null || child === undefined || child === false || child === true) {
        return;
      }
      $el.appendChild(createElement(child));
    });
  }

  return $el;
}
