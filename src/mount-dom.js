const { DOM_TYPES, h } = require("./h");

const insert = (el, parentEl, idx) => {
  if (idx == null) {
    parentEl.append(el);
    return;
  }

  if (idx < 0) {
    throw new Error(`Index must be a positive integer, got ${idx}`);
  }

  const children = parentEl.childNodes;

  if (idx >= children.length) {
    parentEl.append(el);
  } else {
    parentEl.insertBefore(el, children[idx]);
  }
};

const createTextNode = (vdom, parentEl, idx) => {
  const { value } = vdom;

  const textNode = document.createTextNode(value);
  vdom.el = textNode;

  insert(textNode, parentEl, idx);
};

const createFragmentNodes = (vdom, parentEl, idx) => {
  const { children } = vdom;

  vdom.el = parentEl;
  children.forEach((child, i) =>
    mountDOM(child, parentEl, idx ? idx + i : null)
  );
};

const addProps = (el, props, vdom) => {
  const { on: events, ...attrs } = props;

  vdom.listeners = addEventListeners(events, el);
  setAttributes(el, attrs);
};

const createElementNode = (vdom, parentEl, idx) => {
  const { tag, props, children } = vdom;

  const element = document.createElement(tag);
  addProps(element, props, vdom);
  vdom.el = element;

  children.forEach((child) => mountDOM(child, element));
  insert(element, parentEl, idx);
};

const mountDOM = (vdom, parentEl, idx) => {
  switch (vdom.type) {
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl, idx);
      break;
    }
    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl, idx);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      createFragmentNodes(vdom, parentEl, idx);
      break;
    }
    default: {
      throw new Error(`Can't mounth DOM of type: ${vdom.type}`);
    }
  }
};

module.exports = {
  mountDOM,
};
