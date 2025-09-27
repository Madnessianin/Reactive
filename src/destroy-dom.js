const { removeEventListeners } = require("./events");
const { DOM_TYPES } = require("./h");

const removeTextNode = (vdom) => {
  const { el } = vdom;
  el.remove();
};

const removeElementNode = (vdom) => {
  const { el, children, listeners } = vdom;

  el.remove();
  children.forEach(destroyDOM);

  if (listeners) {
    removeEventListeners(listeners, el);
    delete vdom.listeners;
  }
};

const removeFragmentNodes = (vdom) => {
  const { children } = vdom;
  children.forEach(destroyDOM);
};

const destroyDOM = (vdom) => {
  const { type } = vdom;

  switch (type) {
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom);
      break;
    }
    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      removeFragmentNodes(vdom);
      break;
    }
    default: {
      throw new Error(`Can't destroy DON of type ${type}`);
    }
  }

  delete vdom.el;
};

module.exports = {
  destroyDOM,
};
