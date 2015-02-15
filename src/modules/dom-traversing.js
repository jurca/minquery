MinQueryLoader.define("dom-traversing", ["MinQuery"], function (MinQuery) {
  "use strict";

  return {
    /**
     * Creates a new collection of the children of the elements in this
     * collection, matching the specified selector (if specified).
     *
     * @param {string=} selector The CSS selector to use to filter the parents.
     * @return {MinQuery} The collection of the filtered children.
     */
    children: function (selector) {
      return new MinQuery(this.contents().filter(function (element) {
        return (element.nodeType === Node.ELEMENT_NODE) &&
            (!selector || element.matches(selector));
      }));
    },

    /**
     * Creates a new collection of the children of the elements in this
     * collection, including comments, text nodes, etc.
     *
     * @return {MinQuery} A colletion of the child nodes.
     */
    contents: function () {
      var allChildren = [];

      this.forEach(function (element) {
        var children = [].slice.call(element.children);
        allChildren = allChildren.concat(children);
      });

      return new MinQuery(allChildren);
    },

    /**
     * Creates a new collection of elements matching the provided CSS selector
     * in the context of the elements within this collection.
     *
     * @param {string} selector The CSS selector to use for selecting the
     *        elements of the returned collection.
     * @return {MinQuery} The new collection of the matched elements.
     */
    find: function (selector) {
      var newElements = [];
      this.forEach(function (element) {
        newElements.push.apply(newElements, find(selector, element));
      });
      return new MinQuery(newElements);
    },

    /**
     * Creates a new collection of the immediately following sibling of each
     * element in this collections, additionaly filtered by the specified
     * selector.
     *
     * @param {string=} selector The optional filtering CSS selector.
     * @return {MinQuery} The collection of following siblings.
     */
    next: function (selector) {
      var siblings = this.map(function (element) {
        return element.nextSibling;
      }).filter(function (sibling) {
        return !!sibling && (!selector || sibling.matches(selector));
      });

      return new MinQuery(siblings);
    },

    /**
     * Creates a new collection of the parents of the elements of this
     * collection, matching the specified selector (if specified).
     *
     * @param {string=} selector The CSS selector to use to filter the parents.
     * @return {MinQuery} The collection of the filtered parents.
     */
    parent: function (selector) {
      var parents = this.map(function (element) {
        return element.parentNode;
      });

      if (selector) {
        return parents.filter(function (element) {
          return element.matches(selector);
        });
      }

      return new MinQuery(parents);
    }
  };

  /**
   * Retrieves the elements matched by the specified CSS selector within the
   * specified context.
   *
   * @param {string} selector The CSS selector to use to retrieve the elements.
   * @param {(Document|Element|Array<(Document|Element)>)} context The context
   *        within which the elements should be retrieved.
   * @return {Element[]} The retrieved elements.
   */
  function find(selector, context) {
    if (context instanceof Array) {
      var parts = context.map(function (subContext) {
        return find(selector, subContext);
      });
      return [].concat.apply([], parts);
    }

    return Array.prototype.slice.call(context.querySelectorAll(selector));
  }
});
