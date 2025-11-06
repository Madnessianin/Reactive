const extractPropsAndEvents = (vdom) => {
  const { on: events = {}, ...props } = vdom.props;
  delete props.key;

  return { props, events };
};

module.exports = {
  extractPropsAndEvents,
};
