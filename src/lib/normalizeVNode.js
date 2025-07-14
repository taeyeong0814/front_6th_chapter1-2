/**
 * 컴포넌트 함수를 실행하고 다양한 타입의 값들을 표준화
 * @param {any} vNode - 정규화할 Virtual DOM 노드
 * @returns {string|Object|Array} 정규화된 Virtual DOM 노드
 */
export function normalizeVNode(vNode) {
  // 1. vNode가 null, undefined 또는 boolean 타입일 경우 빈 문자열을 반환합니다.
  if (vNode == null || typeof vNode === "boolean") {
    return "";
  }

  // 2. vNode가 문자열 또는 숫자일 경우 문자열로 변환하여 반환합니다.
  if (typeof vNode === "string" || typeof vNode === "number") {
    return String(vNode);
  }

  // 3. vNode의 타입이 함수일 경우 해당 함수를 호출하여 반환된 결과를 재귀적으로 표준화합니다.
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

  // 배열인 경우 각 요소를 정규화하고 null/undefined 값 제거
  if (Array.isArray(vNode)) {
    return vNode.map(normalizeVNode).filter((v) => v != null);
  }

  // 일반 vNode인 경우 children을 정규화
  if (vNode && typeof vNode === "object" && vNode.type) {
    return {
      ...vNode,
      children: Array.isArray(vNode.children)
        ? vNode.children.map(normalizeVNode).filter((v) => v != null)
        : vNode.children != null
          ? normalizeVNode(vNode.children)
          : [],
    };
  }

  // 그 외의 경우, vNode의 자식 요소들을 재귀적으로 표준화하고, null 또는 undefined 값을 필터링하여 반환합니다.
  return vNode;
}
