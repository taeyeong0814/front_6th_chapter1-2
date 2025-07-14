import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

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
        // 불리언 속성 처리
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
    const maxLength = Math.max(
      newNode.children ? newNode.children.length : 0,
      oldNode.children ? oldNode.children.length : 0,
    );

    for (let i = 0; i < maxLength; i++) {
      updateElement(element, newNode.children && newNode.children[i], oldNode.children && oldNode.children[i], i);
    }
  }
}
