MinQueryLoader.define("forms", [], function () {
  "use strict";

  return {
    /**
     * Sets the value of all elements of this collection or retrieves the value
     * of the first one.
     *
     * @param {(string|function(Element, number, string): string)=}
     *        valueGenerator The value to set or a callback function that
     *        provides the value to set to the elements. The callback will be
     *        invoked for each element in the collection with the following
     *        arguments: the element having its value set, the index of the
     *        element in this collection and the current value of the element.
     *        Leave this argument out to retrieve the value of the first
     *        element.
     * @return {(MinQuery|string)} This collection if the value has been set,
     *         or the value of the first element in this collection if no value
     *         or value generator has been provided.
     */
    val: function (valueGenerator) {
      if (!arguments.length) {
        return this[0].value;
      }

      if (typeof valueGenerator === "string") {
        var newValue = valueGenerator;
        valueGenerator = function () {
          return newValue;
        };
      }

      this.forEach(function (element, index) {
        element.value = valueGenerator.call(element, index, element.value);
      });

      return this;
    }
  };
});
