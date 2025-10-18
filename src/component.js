const { mountDOM } = require("./mount-dom");
const { destroyDOM } = require("./destroy-dom");
const { patchDOM } = require("./patch-dom");
const { DOM_TYPES, extractChildren } = require("./h");

const defineComponrnt = ({ render, state }) => {
  class Component {
    #vdom = null;
    #hostEl = null;
    #isMounted = false;

    constructor(props = {}) {
      this.props = props;
      this.state = state ? state(props) : {};
    }

    get elements() {
      if (this.#vdom == null) {
        return [];
      }

      if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
        return extractChildren(this.#vdom).map((child) => child.el);
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
      mountDOM(this.#vdom, hostEl, idx);
      this.#hostEl = hostEl;
      this.#isMounted = true;
    }

    unmount() {
      if (!this.#isMounted) {
        throw new Error("Component isn't mounted");
      }
      destroyDOM(this.#vdom);
      this.#vdom = null;
      this.#hostEl = null;
      this.#isMounted = false;
    }

    #patch() {
      if (!this.#isMounted) {
        throw new Error("Component isn't mounted");
      }

      const vdom = this.render();
      this.#vdom = patchDOM(this.#vdom, vdom, this.#hostEl, this);
    }
  }

  return Component;
};

module.exports = {
  defineComponrnt,
};
