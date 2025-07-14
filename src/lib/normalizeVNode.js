/**
 * 컴포넌트 함수를 실행하고 다양한 타입의 값들을 표준화
 * @param {any} vNode - 정규화할 Virtual DOM 노드
 * @returns {string|Object|Array} 정규화된 Virtual DOM 노드
 */
export function normalizeVNode(vNode) {
  // null, undefined, boolean 값은 빈 문자열로 변환
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  // 숫자는 문자열로 변환
  if (typeof vNode === "number") {
    return String(vNode);
  }

  // 문자열은 그대로 반환
  if (typeof vNode === "string") {
    return vNode;
  }

  // 함수형 컴포넌트 처리
  if (vNode && typeof vNode === "object" && typeof vNode.type === "function") {
    const component = vNode.type;
    const props = { ...vNode.props };

    // children을 props에 추가 (React의 children prop)
    if (vNode.children && vNode.children.length > 0) {
      props.children = Array.isArray(vNode.children) ? vNode.children : [vNode.children];
    }

    // 컴포넌트 함수 실행
    const result = component(props);

    // 결과를 재귀적으로 정규화
    return normalizeVNode(result);
  }

  // 배열인 경우 각 요소를 정규화하고 falsy 값 제거
  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).filter((v) => v !== "");
  }

  // 일반 vNode인 경우 children을 정규화
  if (vNode && typeof vNode === "object" && vNode.type) {
    return {
      ...vNode,
      children: Array.isArray(vNode.children)
        ? vNode.children.map(normalizeVNode).filter((v) => v !== "")
        : vNode.children != null
          ? normalizeVNode(vNode.children)
          : [],
    };
  }

  // 그 외의 경우 그대로 반환
  return vNode;
}
