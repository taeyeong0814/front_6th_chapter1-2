import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

// 이렇게 하면 노가다 코드이다. 조금 더 클린하게 가능하다.
function updateAttributes(target, originNewProps, originOldProps) {
  // 기존 속성들 제거
  if (originOldProps) {
    Object.keys(originOldProps).forEach((key) => {
      if (!originNewProps || !(key in originNewProps)) {
        // 이벤트 핸들러 제거
        if (key.startsWith("on") && typeof originOldProps[key] === "function") {
          const eventType = key.slice(2).toLowerCase();
          removeEvent(target, eventType, originOldProps[key]);
        }
        // 일반 속성 제거
        else if (key !== "children") {
          if (key === "className") {
            target.removeAttribute("class");
          } else if (["checked", "selected", "disabled", "readOnly"].includes(key)) {
            // Boolean 속성은 property로 false 설정
            target[key] = false;
            target.removeAttribute(key);
          } else {
            target.removeAttribute(key);
          }
        }
      }
    });
  }

  // 새 속성들 추가/업데이트
  if (originNewProps) {
    Object.entries(originNewProps).forEach(([key, value]) => {
      if (!originOldProps || originOldProps[key] !== value) {
        // 이벤트 핸들러 처리
        if (key.startsWith("on") && typeof value === "function") {
          const eventType = key.slice(2).toLowerCase();
          // 기존 핸들러 제거
          if (originOldProps && originOldProps[key]) {
            removeEvent(target, eventType, originOldProps[key]);
          }
          // 새 핸들러 추가
          addEvent(target, eventType, value);
        }
        // className을 class로 변환
        else if (key === "className") {
          target.setAttribute("class", value);
        }
        // 불리언 속성 처리 (property로 설정)
        else if (["checked", "selected"].includes(key)) {
          target[key] = value;
          // checked와 selected는 DOM attribute로 설정하지 않음 (property만 사용)
        }
        // 불리언 속성 처리 (DOM attribute도 설정)
        else if (["disabled", "readOnly"].includes(key)) {
          target[key] = value;
          if (value) {
            target.setAttribute(key, "");
          } else {
            target.removeAttribute(key);
          }
        }
        // 불리언 속성 처리 (일반 boolean)
        else if (typeof value === "boolean") {
          if (value) {
            target.setAttribute(key, "");
          } else {
            target.removeAttribute(key);
          }
        }
        // 일반 속성 설정
        else if (key !== "children") {
          target.setAttribute(key, value);
        }
      }
    });
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  // 1. 새 노드가 없는 경우 → 기존 노드 제거
  if (!newNode && oldNode) {
    parentElement.removeChild(parentElement.childNodes[index]);
    return;
  }

  // 2. 기존 노드가 없는 경우 → 새 노드 추가 (동적 추가!)
  if (newNode && !oldNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  // 3. 둘 다 텍스트 노드인 경우
  if (typeof newNode === "string" && typeof oldNode === "string") {
    if (newNode !== oldNode) {
      parentElement.childNodes[index].textContent = newNode;
    }
    return;
  }

  // 4. 노드 타입이 다른 경우 → 완전 교체
  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(createElement(newNode), parentElement.childNodes[index]);
    return;
  }

  // 5. 같은 타입의 요소 → 속성과 자식 요소들 업데이트
  if (newNode.type) {
    const element = parentElement.childNodes[index];

    // 속성 업데이트
    updateAttributes(element, newNode.props, oldNode.props);

    // 자식 요소들 재귀적 업데이트
    const newChildren = newNode.children || [];
    const oldChildren = oldNode.children || [];

    // 먼저 공통 인덱스 범위에 대해 업데이트
    for (let i = 0; i < Math.min(newChildren.length, oldChildren.length); i++) {
      updateElement(element, newChildren[i], oldChildren[i], i);
    }

    // 새로운 자식들 추가
    for (let i = oldChildren.length; i < newChildren.length; i++) {
      element.appendChild(createElement(newChildren[i]));
    }

    // 초과하는 기존 자식들 제거 (역순으로)
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      const childToRemove = element.childNodes[i];
      if (childToRemove) {
        element.removeChild(childToRemove);
      }
    }
  }
}
