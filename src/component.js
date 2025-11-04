const { mountDOM } = require("./mount-dom");
const { destroyDOM } = require("./destroy-dom");
const { patchDOM } = require("./patch-dom");
const { DOM_TYPES, extractChildren } = require("./h");
const { hasOwnProperty } = require("./utils/objects");
const { Dispatcher } = require("./dispatcher");
const equal = require("fast-deep-equal");

const defineComponrnt = ({ render, state, ...methods }) => {
  class Component {
    #vdom = null;
    #hostEl = null;
    #isMounted = false;
    #eventHandlers = null;
    #parentComponent = null;
    #dispatcher = new Dispatcher();
    #subscriptions = [];

    constructor(props = {}, eventHandles = {}, parentComponenet = null) {
      this.props = props;
      this.state = state ? state(props) : {};
      this.#eventHandlers = eventHandles;
      this.#parentComponent = parentComponenet;
    }

    get elements() {
      if (this.#vdom == null) {
        return [];
      }

      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return extractChildren(this.#vdom).flatMap((child) => {
          if (child.type === DOM_TYPES.COMPONENT) {
            return child.component.elements;
          }

          return [child.el];
        });
      }

      return [this.#vdom.el];
    }

    get firstElement() {
      return this.elements[0];
    }

    get offset() {
      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return Array.from(this.#hostEl.children).indexOf(this.firstElement);
      }

      return 0;
    }

    emit(eventName, payload) {
      this.#dispatcher.dispatch(eventName, payload);
    }

    updateProps(props) {
      const newProps = { ...this.props, ...props };
      if (equal(this.props, newProps)) {
        return;
      }
      this.props = newProps;
      this.#patch();
    }

    updateState(state) {
      this.state = { ...this.state, ...state };
      this.#patch();
    }

    render() {
      return render.call(this);
    }

    mount(hostEl, idx = null) {
      if (this.#isMounted) {
        throw new Error("Component is already mounted");
      }
      this.#vdom = this.render();
      mountDOM(this.#vdom, hostEl, idx, this);
      this.#wireEventHandlers();

      this.#hostEl = hostEl;
      this.#isMounted = true;
    }

    unmount() {
      if (!this.#isMounted) {
        throw new Error("Component isn't mounted");
      }
      destroyDOM(this.#vdom);

      this.#subscriptions.forEach((unsubscribe) => unsubscribe());

      this.#vdom = null;
      this.#hostEl = null;
      this.#isMounted = false;
      this.#subscriptions = [];
    }

    #patch() {
      if (!this.#isMounted) {
        throw new Error("Component isn't mounted");
      }

      const vdom = this.render();
      this.#vdom = patchDOM(this.#vdom, vdom, this.#hostEl, this);
    }

    #wireEventHandler(eventName, handler) {
      return this.#dispatcher.subscribe(eventName, (payload) => {
        if (this.#parentComponent) {
          handler.call(this.#parentComponent, payload);
        } else {
          handler(payload);
        }
      });
    }

    #wireEventHandlers() {
      this.#subscriptions = Object.entries(this.#eventHandlers).map(
        ([eventName, handler]) => this.#wireEventHandler(eventName, handler)
      );
    }
  }

  for (const methodName in methods) {
    if (hasOwnProperty(Component, methodName)) {
      throw new Error(
        `Method "${methodName}()" already exist in the component`
      );
    }

    Component.prototype[methodName] = methods[methodName];
  }

  return Component;
};

module.exports = {
  defineComponrnt,
};
