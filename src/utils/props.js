const extractPropsAndEvents = (vdom) => {
  const { on: events = {}, ...props } = vdom.props;

  return { props, events };
};

module.exports = {
  extractPropsAndEvents,
};
