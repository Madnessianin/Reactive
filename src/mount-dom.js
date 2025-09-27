const { DOM_TYPES, h } = require("./h");

const createTextNode = (vdom, parentEl) => {
  const { value } = vdom;

  const textNode = document.createTextNode(value);
  vdom.el = textNode;

  parentEl.append(textNode);
};

const createFragmentNodes = (vdom, parentEl) => {
  const { children } = vdom;

  vdom.el = parentEl;
  children.forEach((child) => mountDOM(child, parentEl));
};

const addProps = (el, props, vdom) => {
  const { on: events, ...attrs } = props;

  vdom.listeners = addEventListeners(events, el);
  setAttributes(el, attrs);
};

const createElementNode = (vdom, parentEl) => {
  const { tag, props, children } = vdom;

  const element = document.createElement(tag);
  addProps(element, props, vdom);
  vdom.el = element;

  children.forEach((child) => mountDOM(child, element));
  parentEl.append(element);
};

const mountDOM = (vdom, parentEl) => {
  switch (vdom.type) {
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl);
      break;
    }
    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      createFragmentNodes(vdom, parentEl);
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
