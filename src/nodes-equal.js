const { DOM_TYPES } = require("./h");

const areNodesEqual = (nodeOne, nodeTwo) => {
  if (nodeOne.type !== nodeTwo.type) {
    return false;
  }
  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    const { tag: tagOne } = nodeOne;
    const { tag: tagTwo } = nodeTwo;

    return tagOne === tagTwo;
  }

  return true;
};

module.exports = {
  areNodesEqual,
};
