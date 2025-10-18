const addEventListener = (eventName, handler, el, hostComponent = null) => {
  const boundHandler = () =>
    hostComponent
      ? handler.apply(hostComponent, arguments)
      : handler(...arguments);
  el.addEventListener(eventName, boundHandler);
  return boundHandler;
};

const removeEventListeners = (listeners = {}, el) => {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler);
  });
};

const addEventListeners = (listeners = {}, el, hostComponent = null) => {
  const addedListeners = {};

  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(eventName, handler, el, hostComponent);
    addedListeners[eventName] = listener;
  });

  return addedListeners;
};

module.exports = {
  addEventListener,
  addEventListeners,
  removeEventListeners,
};
