MinQueryLoader.define("attributes-manipulation", ["MinQuery"],
    function (MinQuery) {
  "use strict";

  return {
    /**
     * Sets or retrieves the specified attribute. The attribute is set on all
     * elements of the collection, but retrieved only from the first one.
     *
     * @param {(string|Object<string, (number|string)>)} name The name of the
     *        attribute to retrieve or set, or a map of atttribute names to
     *        values to set.
     * @param {(number|string|function(number, string): (number|string))=} value
     *        The value to set to the elements of this collection, or a value
     *        generator. The value generator will be invoked on each element as
     *        {@code this}, with the following arguments: the index of the
     *        element in this collection and the old value of the attribute.
     * @return {(string|MinQuery)} The value of the retrieved attribute or this
     *         collection.
     */
    attr: function (name, value) {
      if (arguments.length === 1) {
        if (typeof name === "string") {
          return this[0].getAttribute(name);
        } else {
          Object.keys(name).forEach(function (attributeName) {
            this.attr(attributeName, name[attributeName]);
          }.bind(this));
        }
      }

      if (!(value instanceof Function)) {
        var newValue = value;
        value = function () {
          return newValue;
        };
      }

      this.forEach(function (element, index) {
        oldValue = (new MinQuery(element)).attr(name);
        var newValue = value.call(element, index, oldValue);
        element.setAttribute(name, newValue);
      });

      return this;
    },

    /**
     * Removes the specified attribute from all elements in this collection.
     *
     * @param {string} name The name of the attribute to remove.
     * @return {MinQuery} This collection.
     */
    removeAttr: function (name) {
      this.forEach(function (element) {
        element.removeAttribute(name);
      });

      return this;
    }
  };
});
