MinQueryLoader.define("collection-manipulation", ["MinQuery"],
    function (MinQuery) {
  "use strict";

  return {
    /**
     * Reduces the collection to a single element at the specified index.
     *
     * @param {number} index The index of the element from start (if
     *        non-negative) or from end (if negative, -1 is the last one).
     * @return {MinQuery} Collection containing only the specified element.
     */
    eq: function (index) {
      if (index >= 0) {
        return new MinQuery(this[index]);
      } else {
        return new MinQuery(this[this.length - index]);
      }
    }
  };
});
