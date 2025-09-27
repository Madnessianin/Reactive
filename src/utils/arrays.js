const withoutNulls = (arr) => {
  return arr.filter((item) => item != null);
};

module.exports = {
  withoutNulls,
};
