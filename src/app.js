const { destroyDOM } = require("./destroy-dom");
const { Dispatcher } = require("./dispatcher");
const { mountDOM } = require("./mount-dom");

const createApp = ({ state, view, reducers = {} }) => {
  let parentEl = null;
  let vdom = null;

  const dispatcher = new Dispatcher();
  const subscritions = [dispatcher.afterEveryCommand(renderApp)];

  const emit = (eventName, payload) => {
    dispatcher.dispatch(eventName, payload);
  };

  for (const actionName in reducers) {
    const reducer = reducers[actionName];

    const subs = dispatcher.subscribe(actionName, (payload) => {
      state = reducer(state, payload);
    });

    subscritions.push(subs);
  }

  function renderApp() {
    const newVdom = view(state, emit);
    vdom = patchDOM(vdom, newVdom, parentEl);
  }

  return {
    mount(_parentEl) {
      parentEl = _parentEl;
      vdom = view(state, emit);
      mountDOM(vdom, parentEl);
    },

    unpount() {
      destroyDOM(vdom);
      vdom = null;
      subscritions.forEach((unsubscribe) => unsubscribe());
    },
  };
};

module.exports = {
  createApp,
};
