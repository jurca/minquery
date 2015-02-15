MinQueryLoader.define("data-manipulation", [], function () {
  "use strict";

  return {
    /**
     * Sets or retrieves the data on the first element of this collection.
     *
     * @param {(string|Object<string, *>)=} keyOrMap The name of the data key
     *        to set or retrieve, or a map of data key names to values to set
     *        to them (the value cannot be {@code undefined})
     * @param {*=} value The value to set to the data identified by
     *        {@code keyOrMap} (must be string).
     * @return {(*|Object<string, *>|MinQuery)} This collection, or the value
     *         of the requested data (if {@code keyOrMap} is a string), or a
     *         map of all data names to their values on the first element in
     *         this collection. The return value is this collection if the
     *         method was invoked to set or update the data.
     */
    data: function (keyOrMap, value) {
      if (!arguments.length) {
        var result = {};
        for (var property in this[0].dataset) {
          result[property] = JSON.parse(this[0].dataset[property]);
        }
        return result;
      }

      if (typeof keyOrMap === "string") {
        if (value === undefined) {
          return JSON.parse(this[0].dataset[keyOrMap]);
        }

        this[0].dataset[keyOrMap] = JSON.stringify(value);
      } else {
        Object.keys(keyOrMap).forEach(function (key) {
          this.data(key, keyOrMap[key]);
        }.bind(this));
      }

      return this;
    },

    /**
     * Removes the specified data from the first element in this collection.
     *
     * @param {(string|string[])=} names The name or names of keys to delete
     *        from the data of the first element in this collection. Leave this
     *        argument out to delete all data associated with the first
     *        element.
     */
    removeData: function (names) {
      if (typeof names === "string") {
        delete this[0].dataset[names];
      } else if (names instanceof Array) {
        names.forEach(function (name) {
          this.removeData(name);
        }.bind(this));
      } else if (!arguments.length) {
        this.removeData(Object.keys(this.data()));
      }
    }
  };
});
