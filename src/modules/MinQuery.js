MinQueryLoader.define("MinQuery", [], function () {
  "use strict";

  /**
   * The MinQuery is an alternative implementation of the Angular's jqLite (or
   * jQuery lite) integrated DOM traversal & manipulation library based on the
   * jQuery library ({@link http://jquery.com}).
   *
   * This implementation differs from the Angular's in the following ways:
   * - MinQuery does not provide polyfills or browser abstraction, it is
   *   targetted only on the evergreen browsers or pages that already have the
   *   polyfills loaded.
   * - all implemented methods are 100% compatible with jQuery 2.1.3, however,
   *   use for MinQuery and jQuery simultaneously may result in various quirks.
   * - MinQuery does not provide the jqLite extensions (extra events and
   *   methods that are not part of jQuery).
   * - MinQuery instances are also arrays, to make manipulation of the elements
   *   in the collection more convenient.
   *
   * @extends {Array}
   */
  MinQuery.prototype = Object.create(Array.prototype);
  MinQuery.prototype.constructor = MinQuery;
  function MinQuery(_1, _2) {
    if (!arguments.length) {
      _1 = document;
    }

    if (_1 instanceof Function) {
      return (new MinQuery()).ready(_1);
    } else if ((typeof _1 === "string") && (_1.trim().charAt(0) === "<")) {
      return new MinQuery(htmlToDom(_1, _2));
    } else if (typeof _1 === "string") {
      return (new MinQuery(_2 ? _2 : document)).find(_1);
    }

    if (!(this instanceof MinQuery)) {
      var instance = new MinQuery();
      MinQuery.apply(instance, arguments);
      return instance;
    }

    if (_1 instanceof Array) {
      Array.call(this, _1.length);
      this.push.apply(this, _1);
    } else {
      Array.call(this, arguments.length);
      this.push.apply(this, arguments);
    }
  }

  /**
   * Converts the provided HTML string to a sequence of DOM nodes in a
   * jQuery-compatible way: Any characters before the first &lt; and after the
   * last &gt; will be trimmed.
   *
   * @param {string} html A string containing HTML code.
   * @param {(Document|Object<string, *>)} documentOrAttributes The document
   *        within which the HTML elements should be created, or an attributes
   *        map object to pass to the {@code attr()} method.
   * @return {Array<Node>} An array of the constructed elements, comments and
   *         text nodes.
   */
  function htmlToDom(html, documentOrAttributes) {
    var leftStripped = html.substring(html.indexOf("<"));
    var stripped = leftStripped.substring(0, leftStripped.lastIndexOf(">"));

    var contextDocument = document;
    var attributes = null;
    if (documentOrAttributes instanceof Document) {
      contextDocument = documentOrAttributes;
    } else if (documentOrAttributes instanceof Object) {
      attributes = documentOrAttributes;
    }

    var container = contextDocument.createElement("div");
    container.innerHTML = stripped;
    var result = [];

    while (container.firstChild) {
      result.push(container.removeChild(container.firstChild));
    }

    if (attributes) {
      return new MinQuery(result).attr(attributes);
    }

    return result;
  }

  return MinQuery;
});
