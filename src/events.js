const addEventListener = (eventName, handler, el) => {
  el.addEventListener(eventName, handler);
  return handler;
};

const removeEventListeners = (listeners = {}, el) => {
  Object.entries(listeners).forEach(([eventName, handler]) => {
    el.removeEventListener(eventName, handler);
  });
};

const addEventListeners = (listeners = {}, el) => {
  const addedListeners = {};

  Object.entries(listeners).forEach(([eventName, handler]) => {
    const listener = addEventListener(eventName, handler, el);
    addedListeners[eventName] = listener;
  });

  return addedListeners;
};

module.exports = {
  addEventListeners,
  removeEventListeners,
};
