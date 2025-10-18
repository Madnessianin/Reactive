const {
  removeAttribute,
  setAttributes,
  removeStyle,
  setStyle,
} = require("./attributes");
const { destroyDOM } = require("./destroy-dom");
const { addEventListeners } = require("./events");
const { DOM_TYPES, extractChildren } = require("./h");
const { mountDOM } = require("./mount-dom");
const { areNodesEqual } = require("./nodes-equal");
const {
  arraysDiff,
  arraysDiffSequence,
  ARRAY_DIFF_OP,
} = require("./utils/arrays");
const { objectsDiff } = require("./utils/objects");
const { isNotBlankOrEmptyString } = require("./utils/strings");

const findIdxInParent = (parentEl, el) => {
  const idx = Array.from(parentEl.childNodes).indexOf(el);

  return idx < 0 ? null : idx;
};

const toClassList = (classes = "") => {
  return Array.isArray(classes)
    ? classes.filter(isNotBlankOrEmptyString)
    : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString);
};

const patchAttrs = (el, oldAttrs, newAttrs) => {
  const { added, removed, updated } = objectsDiff(oldAttrs, newAttrs);

  for (const attr of removed) {
    removeAttribute(el, attr);
  }

  for (const attr of added.concat(updated)) {
    setAttributes(el, attr, newAttrs[attr]);
  }
};

const patchClasses = (el, oldClass, newClass) => {
  const oldClasses = toClassList(oldClass);
  const newClasses = toClassList(newClass);

  const { added, removed } = arraysDiff(oldClasses, newClasses);

  if (removed.length > 0) {
    el.classList.remove(...removed);
  }
  if (added.length > 0) {
    el.classList.add(...added);
  }
};

const patchStyles = (el, oldStyle = {}, newStyle = {}) => {
  const { added, removed, updated } = objectsDiff(oldStyle, newStyle);

  for (const style of removed) {
    removeStyle(el, style);
  }

  for (const style of added.concat(updated)) {
    setStyle(el, style, newStyle[style]);
  }
};

const patchEvents = (el, oldListeners = {}, oldEvents = {}, newEvents = {}) => {
  const { added, removed, updated } = objectsDiff(oldEvents, newEvents);

  for (const eventName of removed.concat(updated)) {
    el.removeEventListener(eventName, oldListeners[eventName]);
  }

  const addedListeners = {};

  for (const eventName of added.concat(updated)) {
    const listener = addEventListeners(eventName, newEvents[eventName], el);
    addedListeners[eventName] = listener;
  }

  return addedListeners;
};

const patchChildren = (oldVdom, newVdom, hostComponent) => {
  const oldChildren = extractChildren(oldVdom);
  const newChildren = extractChildren(newVdom);
  const parentEl = oldVdom.el;

  const diffSeq = arraysDiffSequence(oldChildren, newChildren, areNodesEqual);

  for (const operation of diffSeq) {
    const { originalIdx, idx, item, op } = operation;
    const offset = hostComponent?.offset ?? 0;
    switch (op) {
      case ARRAY_DIFF_OP.ADD: {
        mountDOM(item, parentEl, idx + offset, hostComponent);
        break;
      }
      case ARRAY_DIFF_OP.REMOVE: {
        destroyDOM(item);
        break;
      }
      case ARRAY_DIFF_OP.MOVE: {
        const oldChild = oldChildren[originalIdx];
        const newChild = newChildren[idx];
        const el = oldChild.el;
        const elAtTargetIndex = parentEl.childNodes[idx + offset];

        parentEl.inserBefore(el, elAtTargetIndex);
        patchDOM(oldChild, newChild, parentEl, hostComponent);

        break;
      }
      case ARRAY_DIFF_OP.NOOP: {
        patchDOM(
          oldChildren[originalIdx],
          newChildren[idx],
          parentEl,
          hostComponent
        );
        break;
      }
      default: {
        throw new Error(`Unknow operation ${op}`);
      }
    }
  }
};

const patchText = (oldVdom, newVdom) => {
  const el = oldVdom.el;
  const { value: oldText } = oldVdom;
  const { value: newText } = newVdom;

  if (oldText !== newText) {
    el.nodeValue = newText;
  }
};

const patchElement = (oldVdom, newVdom) => {
  const el = oldVdom.el;
  const {
    class: oldClass,
    style: oldStyle,
    on: oldEvents,
    ...oldAttrs
  } = oldVdom.props;
  const {
    class: newClass,
    style: newStyle,
    on: newEvents,
    ...newAttrs
  } = newVdom.props;
  const { listeners: oldListeners } = oldVdom;

  patchAttrs(el, oldAttrs, newAttrs);
  patchClasses(el, oldClass, newClass);
  patchStyles(el, oldStyle, newStyle);
  newVdom.listeners = patchEvents(el, oldListeners, oldEvents, newEvents);

  patchChildren(oldVdom, newVdom);

  return newVdom;
};

const patchDOM = (oldVdom, newVdom, parentEl, hostComponent = null) => {
  if (!areNodesEqual(oldVdom, newVdom)) {
    const idx = findIdxInParent(parentEl, oldVdom.el);
    destroyDOM(oldVdom);
    mountDOM(newVdom, parentEl, idx);
  }

  newVdom.el = oldVdom.el;

  switch (newVdom.type) {
    case DOM_TYPES.TEXT: {
      patchText(oldVdom, newVdom);
      return newVdom;
    }
    case DOM_TYPES.ELEMENT: {
      patchElement(oldVdom, newVdom);
      break;
    }
  }

  patchChildren(oldVdom, newVdom, hostComponent);

  return newVdom;
};

module.exports = {
  patchDOM,
};
