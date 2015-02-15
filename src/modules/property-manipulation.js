MinQueryLoader.define("property-manipulation", [], function () {
  "use strict";

  return {
    /**
     * Sets or retrieves the specified properties of the elements of this
     * collection.
     *
     * @param {(string|Object<string, string>)} property The property to set or
     *        retrieve, or a map of property names to the values to set.
     * @param {*=} value The value to set to a single property. Omit this
     *        argument when passing in a map of properties or retrieving the
     *        value of a property.
     * @return {(MinQuery|*)} The value of the property retrieved from the
     *         first element, or this collection.
     */
    prop: function (property, value) {
      if (arguments.length === 1) {
        if (typeof property === "string") {
          return this[0][property];
        }

        Object.keys(property).forEach(function (propertyName) {
          this.prop(propertyName, property[propertyName]);
        }.bind(this));

        return this;
      }

      if (!(value instanceof Function)) {
        var newValue = value;
        value = function () {
          return newValue;
        };
      }

      this.forEach(function (element, index) {
        element[property] = value.call(element, index, element[property]);
      });

      return this;
    },

    /**
     * Sets or retrieves the specified CSS properties of the elements of this
     * collection.
     *
     * @param {(string|string[]|Object<string, string>)} property The name of
     *        the CSS property to retrieve from the first element (if
     *        {@code value} is not provided) or set to all elements, or names
     *        of CSS properties to retrieve from the first element, or a map of
     *        CSS property names to values to which they should be set for all
     *        elements.
     * @param {string=} value The value to set to all elements of this
     *        collection.
     * @return {(MinQuery|string|Object<string, string>)} This collection (when
     *         setting the properties), or the value of the requested property,
     *         or a map of property names to their values for the requested
     *         properties.
     */
    css: function (property, value) {
      if (arguments.length === 1) {
        if (typeof property === "string") {
          return getComputedStyle(this[0], null).getPropertyValue(property);
        }

        if (property instanceof Array) {
          var result = {};
          property.forEach(function (propertyName) {
            result[propertyName] = this.css(propertyName);
          }.bind(this));
          return result;
        }

        Object.keys(property).forEach(function (propertyName) {
          this.css(propertyName, property[propertyName]);
        }.bind(this));

        return this;
      }

      if (!(value instanceof Function)) {
        var valueToSet = value;
        value = function () {
          return valueToSet;
        };
      }

      this.forEach(function (element, index) {
        var newValue = value.call(element, index, this.css(property));
        element.style[property] = newValue;
      }.bind(this));

      return this;
    }
  };
});
