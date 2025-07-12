export function createVNode(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.length === 1 ? children[0] : children,
  };
}
