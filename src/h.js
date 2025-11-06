const { withoutNulls } = require("./utils/arrays");

const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
  COMPONENT: "component",
};

const hString = (str) => {
  return { type: DOM_TYPES.TEXT, value: str };
};

const mapTextNodes = (children) => {
  return children.map((child) =>
    typeof child === "string" ? hString(child) : child
  );
};

const extractChildren = (vdom) => {
  if (vdom.children == null) {
    return [];
  }

  const children = [];

  for (const child of vdom.children) {
    if (child.type === DOM_TYPES.FRAGMENT) {
      children.push(...extractChildren(child, children)); //TODO: Error function?
    } else {
      children.push(child);
    }
  }
};

const hFragment = (vNodes) => {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes)),
  };
};

const h = (tag, props = {}, children = []) => {
  const type =
    typeof tag === "string" ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type,
  };
};

module.exports = {
  DOM_TYPES,
  hString,
  hFragment,
  h,
  extractChildren,
};

/*const example = h("form", { class: "login-form", action: "login" }, [
  h("input", { type: "text", name: "user" }),
  h("input", { type: "password", name: "pass" }),
  h("button", { on: { click: () => {} } }, ["Log in"]),
]);

console.log(example);*/
