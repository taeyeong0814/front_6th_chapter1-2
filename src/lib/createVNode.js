/**
 * JSX 문법을 Virtual DOM 객체로 변환
 * @param {string|Function} type - HTML 태그명 또는 컴포넌트 함수
 * @param {Object|null} props - 엘리먼트 속성들
 * @param {...any} children - 자식 노드들
 * @returns {Object} Virtual DOM 노드 객체
 */
export function createVNode(type, props, ...children) {
  // 배열을 평탄화 (map으로 생성된 중첩 배열 처리)
  const flattenedChildren = children.flat(Infinity);

  // falsy 값들(null, undefined, false, true) 필터링
  const filteredChildren = flattenedChildren.filter(
    (child) => child !== null && child !== undefined && child !== false && child !== true,
  );

  return {
    type,
    props: props === undefined ? {} : props, // undefined만 빈 객체로, null은 null 유지
    children: filteredChildren,
  };
}
