const { DOM_TYPES, h } = require("./h");
const { extractPropsAndEvents } = require("./utils/props");

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

const createFragmentNodes = (vdom, parentEl, idx, hostComponent) => {
  const { children } = vdom;

  vdom.el = parentEl;
  children.forEach((child, i) =>
    mountDOM(child, parentEl, idx ? idx + i : null, hostComponent)
  );
};

const addProps = (el, props, vdom, hostComponent) => {
  const { on: events, ...attrs } = props;

  vdom.listeners = addEventListeners(events, el, hostComponent);
  setAttributes(el, attrs);
};

const createElementNode = (vdom, parentEl, idx, hostComponent) => {
  const { tag, props, children } = vdom;

  const element = document.createElement(tag);
  addProps(element, props, vdom, hostComponent);
  vdom.el = element;

  children.forEach((child) => mountDOM(child, element, null, hostComponent));
  insert(element, parentEl, idx);
};

const createComponentNode = (vdom, parentEl, idx, hostComponent) => {
  const Component = vdom.tag;
  const { props, events } = extractPropsAndEvents(vdom);
  const component = new Component(props, events, hostComponent);

  component.mount(parentEl, idx);
  vdom.component = component;
  vdom.el = component.firstElement;
};

const mountDOM = (vdom, parentEl, idx, hostComponent = null) => {
  switch (vdom.type) {
    case DOM_TYPES.TEXT: {
      createTextNode(vdom, parentEl, idx);
      break;
    }
    case DOM_TYPES.ELEMENT: {
      createElementNode(vdom, parentEl, idx, hostComponent);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      createFragmentNodes(vdom, parentEl, idx, hostComponent);
      break;
    }
    case DOM_TYPES.COMPONENT: {
      createComponentNode(vdom, parentEl, idx, hostComponent);
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
