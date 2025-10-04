const objectsDiff = (oldObj, newObj) => {
  const oldKeys = Object.keys(oldObj);
  const newKeys = Object.keys(newObj);

  return {
    added: newKeys.filter((key) => !(key in oldKeys)),
    removed: oldKeys.filter((key) => !(key in newKeys)),
    updated: newKeys.filter(
      (key) => key in oldObj && oldObj[key] !== newObj[key]
    ),
  };
};

module.exports = {
  objectsDiff,
};
