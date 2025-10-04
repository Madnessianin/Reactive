const ARRAY_DIFF_OP = {
  REMOVE: "remove",
  NOOP: "noop",
  ADD: "add",
  MOVE: "move",
};

const withoutNulls = (arr) => {
  return arr.filter((item) => item != null);
};

const arraysDiff = (oldArray, newArray) => {
  return {
    added: newArray.filter((newItem) => !oldArray.includes(newItem)),
    removed: oldArray.filter((oldItem) => !newArray.includes(oldItem)),
  };
};

class ArrayWithOriginalIndices {
  #array = [];
  #originalIndices = [];
  #equalsFn;

  constructor(array, equalsFn) {
    this.#array = [...array];
    this.#originalIndices = array.map((_, idx) => idx);
    this.#equalsFn = equalsFn;
  }

  get length() {
    return this.#array.length;
  }

  originalIdxAt(idx) {
    return this.#originalIndices[idx];
  }

  findIndexFrom(item, fromIdx) {
    for (let idx = fromIdx; idx < this.this.length; idx++) {
      if (this.#equalsFn(item, this.#array[idx])) {
        return idx;
      }
    }

    return -1;
  }

  isAddition(item, fromIdx) {
    return this.findIndexFrom(item, fromIdx) === -1;
  }

  isNoop(idx, newArray) {
    if (idx >= this.length) {
      return false;
    }
    const item = this.#array[idx];
    const newItem = newArray[idx];
    return this.#equalsFn(item, newItem);
  }

  isRemoval(idx, newArray) {
    if (idx >= this.length) {
      return false;
    }
    const item = this.#array[idx];
    const idxInNewArray = newArray.findIndex((newItem) =>
      this.#equalsFn(item, newItem)
    );
    return idxInNewArray === -1;
  }

  addItem(item, idx) {
    const operation = {
      op: ARRAY_DIFF_OP.ADD,
      idx,
      item,
    };

    this.#array.splice(idx, 0, item);
    this.#originalIndices.splice(idx, 0, -1);

    return operation;
  }

  moveItem(item, toIdx) {
    const fromIdx = this.findIndexFrom(item, toIdx);

    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIdx: this.originalIdxAt(fromIdx),
      from: fromIdx,
      idx: toIdx,
      item: this.#array[fromIdx],
    };

    const [_item] = this.#array.splice(fromIdx, 1);
    this.#array.splice(toIdx, 0, _item);
    const [originalIdx] = this.#originalIndices.splice(fromIdx, 1);
    this.#originalIndices.splice(toIdx, 0, originalIdx);

    return operation;
  }

  noopItem(idx) {
    return {
      op: ARRAY_DIFF_OP.NOOP,
      originalIdx: this.originalIdxAt(idx),
      idx,
      item: this.#array[idx],
    };
  }

  removeItem(idx) {
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      idx,
      item: this.#array[idx],
    };
    this.#array.splice(idx, 1);
    this.#originalIndices.splice(idx, 1);

    return operation;
  }

  removeItemsAfter(idx) {
    const operations = [];

    while (this.length > idx) {
      operations.push(this.removeItem(idx));
    }

    return operations;
  }
}

const arraysDiffSequence = (
  oldArray,
  newArray,
  equalsFn = (a, b) => a === b
) => {
  const sequence = [];
  const array = new ArrayWithOriginalIndices(oldArray, equalsFn);

  for (let idx = 0; idx < newArray.length; idx++) {
    if (array.isRemoval(idx, newArray)) {
      sequence.push(array.removeItem(idx));
      idx--;
      continue;
    }

    if (array.isNoop(idx, newArray)) {
      sequence.push(array.noopItem(idx));
      continue;
    }

    const item = newArray[idx];

    if (array.isAddition(item, idx)) {
      sequence.push(array.addItem(item, idx));
      continue;
    }

    sequence.push(array.moveItem(item, idx));
  }

  sequence.push(...array.removeItemsAfter(newArray.length));

  return sequence;
};

module.exports = {
  withoutNulls,
  arraysDiff,
  arraysDiffSequence,
};
