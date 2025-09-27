const { withoutNulls } = require("./utils/arrays");

const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
};

const hstring = (str) => {
  return { type: DOM_TYPES.TEXT, value: str };
};

const mapTextNodes = (children) => {
  return children.map((child) =>
    typeof child === "string" ? hstring(child) : child
  );
};

const hFraggment = (vNodes) => {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes)),
  };
};

const h = (tag, props = {}, children = []) => {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT,
  };
};

module.exports = {
  DOM_TYPES,
  hstring,
  hFraggment,
  h,
};

/*const example = h("form", { class: "login-form", action: "login" }, [
  h("input", { type: "text", name: "user" }),
  h("input", { type: "password", name: "pass" }),
  h("button", { on: { click: () => {} } }, ["Log in"]),
]);

console.log(example);*/
