const { destroyDOM } = require("./destroy-dom");
const { Dispatcher } = require("./dispatcher");
const { mountDOM } = require("./mount-dom");

const createApp = (RootComponent, props = {}) => {
  let parentEl = null;
  let isMounted = false;
  let vdom = null;

  const reset = () => {
    parentEl = null;
    isMounted = false;
    vdom = null;
  };

  return {
    mount(_parentEl) {
      if (isMounted) {
        throw new Error("The applicattion is already mounted");
      }
      parentEl = _parentEl;
      vdom = h(RootComponent, props);
      mountDOM(vdom, parentEl);
      isMounted = true;
    },

    unmount() {
      if (!isMounted) {
        throw new Error("The applicattion is not mounted");
      }
      destroyDOM(vdom);
      reset();
    },
  };
};

module.exports = {
  createApp,
};
