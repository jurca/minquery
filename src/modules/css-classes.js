MinQueryLoader.define("css-classes", ["MinQuery"], function (MinQuery) {
  "use strict";

  return {
    /**
     * Returns {@code true} if any of the elements in this collection has the
     * specified CSS class.
     *
     * @param {string} cssClass The CSS class to check for.
     * @return {boolean} {@code true} if any of the elements in this collection
     *         contains the provided CSS class.
     */
    hasClass: function (cssClass) {
      return this.some(function (element) {
        return element.classList.contains(cssClass);
      });
    },

    /**
     * Adds the specified CSS classes to the elements in this collection.
     *
     * @param {(string|function(Element, number, string): string)}
     *        cssClassGenerator The CSS classes to add provided as a
     *        white-space separated list of class names in a string, or a
     *        callback function that generates the list of classes to add for
     *        each element. The callback function will be executed with the
     *        following arguments: the current element, the index of the
     *        element in this collection and the current CSS classes of the
     *        element as a white-space separated list in a string.
     * @return {MinQuery} This collection.
     */
    addClass: function (cssClassGenerator) {
      if (typeof cssClassGenerator === "string") {
        var cssClasses = cssClassGenerator;
        cssClassGenerator = function () {
          return cssClasses;
        };
      }

      this.forEach(function (element, index) {
        var classes = element.className;
        var newClasses = cssClassGenerator.call(element, index, classes);
        element.classList.add(newClasses);
      });

      return this;
    },

    /**
     * Removes the specified CSS classes from the elements in this collection.
     *
     * @param {(string|function(Element, number, string): string)}
     *        cssClassGenerator The CSS classes to remove provided as a
     *        white-space separated list of class names in a string, or a
     *        callback function that generates the list of classes to remove
     *        for each element. The callback function will be executed with the
     *        following arguments: the current element, the index of the
     *        element in this collection and the current CSS classes of the
     *        element as a white-space separated list in a string.
     * @return {MinQuery} This collection.
     */
    removeClass: function (cssClassGenerator) {
      if (!arguments.length) {
        cssClassGenerator = function (_, classes) {
          return classes;
        };
      }

      if (typeof cssClassGenerator === "string") {
        var cssClasses = cssClassGenerator;
        cssClassGenerator = function () {
          return cssClasses;
        };
      }

      this.forEach(function (element, index) {
        var classes = element.className;
        var toRemove = cssClassGenerator.call(element, index, classes);
        element.classes.remove(toRemove);
      });

      return this;
    },

    /**
     * Toggles the specified CSS class(es) on the elements of this collection.
     * Each CSS class is considered individually on each element.
     *
     * @param {(string|boolean|function(number, string, boolean=): string)=}
     *        className The name(s) (separated by white space) of CSS classes
     *        to toggle, or a boolean specifying whether all CSS classes of the
     *        elements should re-added (if previously removed by this method)
     *        or removed (set to {@code true} to re-add, {@code false} to
     *        remove), or a function that generates the classes to toggle for
     *        each element.
     *        The function will receive the following arguments: the index of
     *        the current element, the current CSS classes separated by
     *        white-space, and the current value of the {@code state} parameter
     *        of this method.
     *        If ommitted, the method will toggle all CSS classes on each
     *        element depending on whether it currently has any.
     * @param {boolean=} state Set to {@code true} if the classes should be
     *        added, or {@code false} to remove the classes. If ommitted, the
     *        method will add the missing classes and remove the present
     *        classes (only the specified CSS classes are affected).
     * @return {MinQuery} This collection.
     */
    toggleClass: function (className, state) {
      if (!arguments.length || (typeof className === "boolean")) {
        var shouldAdd = className;
        this.forEach(function (element) {
          var addNow = shouldAdd === undefined ? !!element.className : shouldAdd;
          if (addNow) {
            var old = (new MinQuery(element)).data("minQueryClasses") || "";
            element.className = old;
          } else {
            (new MinQuery(element)).data("minQueryClasses", element.className);
            element.className = "";
          }
        });
      } else if (className instanceof Function) {
        this.forEach(function (element, index) {
          var oldClasses = element.className;
          var classes = className.call(element, index, oldClasses, state);
          (new MinQuery(element)).toggleClass(classes, state);
        });
      } else if (/\s/.test(className)) {
        className.split(/\s+/).forEach(function (singleClassName) {
          this.toggleClass(singleClassName, state);
        }.bind(this));
      } else if (state === undefined) {
        this.forEach(function (element) {
          var addClass = !(new MinQuery(element)).hasClass(className);
          (new MinQuery(element)).toggleClass(element, addClass);
        });
      } else {
        this.forEach(function (element) {
          if (state) {
            (new MinQuery(element)).addClass(className);
          } else {
            (new MinQuery(element)).removeClass(className);
          }
        });
      }

      return this;
    }
  };
});
