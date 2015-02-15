var MinQuery = (function () {
  'use strict';
/**
 * Simple module initializer loader used to bind all parts of MinQuery
 * together.
 */
var MinQueryLoader = (function () {
  "use strict";

  /**
   * A simple class for preserving the state and meta-information of a module.
   */
  function Module(name, dependencyNames, factory) {
    /**
     * The name of this module, identifying it.
     *
     * @type {string}
     */
    this.name = name;

    /**
     * Names of the modules this module depends on. The dependencies will be
     * initialized and passed to the module's factory function upon module's
     * initialization.
     *
     * @type {string[]}
     */
    this.dependencyNames = Object.freeze(dependencyNames.slice());

    /**
     * Factory function used to initialize the module and create the module
     * value.
     *
     * @type {function(...*): *}
     */
    this.factory = factory;

    /**
     * Whether or not the factory function has already been invoked.
     *
     * @type {boolean}
     */
    this.initialized = false;

    /**
     * The value exported by the module.
     *
     * @type {*}
     */
    this.value = null;
  }

  /**
   * Map of defined modules.
   *
   * @type {Map<string, Module>}
   */
  var modules = new Map();

  return Object.freeze({
    /**
     * Defines a new module of the specified name.
     *
     * @param {string} moduleName The name of the module to define.
     * @param {string[]} dependencyNames The names of the modules this module
     *        depends on.
     * @param {function(...*): *} factory A function used to initialize the
     *        module. The specified dependency modules will be passed to the
     *        factory function in the same order. The function returns a value
     *        that will be used as the value exported by the module.
     * @throw {Error} Thrown if a module of such name is already defined.
     */
    define: function (moduleName, dependencyNames, factory) {
      if (modules.has(moduleName)) {
        throw new Error("The module " + moduleName + " is already defined");
      }

      var module = new Module(moduleName, dependencyNames, factory);
      modules.set(moduleName, module);
    },

    /**
     * Retrieves the specified module. The module is initialized if it has not
     * been already. The module's dependencies are initialized and provided to
     * the module as needed.
     *
     * @param {string} moduleName The name of the module to retrieve.
     * @return {*} The value exported by the module.
     */
    get: function (moduleName) {
      if (!modules.has(moduleName)) {
        throw new Error("The module " + moduleName + " is not defined");
      }

      var module = modules.get(moduleName);
      if (module.initialized) {
        return module.value;
      }

      var dependencies = module.dependencyNames.map(function (dependency) {
        return MinQueryLoader.get(dependency);
      });
      module.value = module.factory.apply(null, dependencies);
      module.initialized = true;
      Object.freeze(module);

      return module.value;
    }
  });
}());

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

MinQueryLoader.define("content-manipulation", [],  function () {
  "use strict";

  return {
    /**
     * Removes all child nodes from all elements in this collection.
     *
     * @return {MinQuery} This collection.
     */
    empty: function () {
      return this.html("");
    },

    /**
     * Sets or retrieves the HTML content of the elements in this collection.
     * When retrieving the content, only the HTML content of the first element
     * is returned.
     *
     * @param {(string|function(number, string): string)=} newContent The new
     *        HTML content to set to the elements in this collection, or a
     *        generator of the content. The generator will be invoked on each
     *        element, {@cod this} will be the current element, the arguments
     *        will be the element index and the current HTML content of the
     *        element.
     *        Ommit this argument to retrieve the HTML content of the first
     *        element.
     * @return {(string|MinQuery)} The HTML content of the first element or
     *         this collection.
     */
    html: function (newContent) {
      if (!arguments.length) {
        return this[0].innerHTML;
      }

      if (!(newContent instanceof Function)) {
        var newHTML = newContent;
        newContent = function () {
          return newHTML;
        };
      }

      this.forEach(function (element, index) {
        var oldContent = element.innerHTML;
        var newElementContent = newContent.call(element, index, oldContent);
        element.innerHTML = newElementContent;
      });

      return this;
    },

    /**
     * Sets or retrieves the text content of the elements of this collection.
     *
     * @param {(string|function(number, string): string)=} text The new text
     *        content to set to all elements, or a function that provides it.
     *        The function will be invoked with the following arguments: the
     *        index of the element in this collection and the current text
     *        content of the element. Ommit this parameter to retrieve the text
     *        content of the elements.
     * @return {(string|MinQuery)} This collection or the retrieved text
     *         content.
     */
    text: function (text) {
      if (!arguments.length) {
        return this.map(function (element) {
          return element.textContent;
        }).join("");
      }

      if (typeof text === "string") {
        var textValue = text;
        text = function () {
          return text;
        };
      }

      this.forEach(function (element, index) {
        element.textContent = text.call(element, index, element.textContent);
      });

      return this;
    }
  };
});

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

MinQueryLoader.define("dom-manipulation", ["MinQuery", "private"],
    function (MinQuery, privateData) {
  "use strict";

  var elementsToEvents = privateData.elementsToEvents;
  var elementsToBoundEvents = privateData.elementsToBoundEvents;

  return {
    /**
     * Inserts the provided content after each element in this collection.
     *
     * @param {(string|Element|Array|function(index, string): (string|Element|Array))}
     *        content An HTML string defining the new content, the HTML
     *        element that is the new content, or an array (or a
     *        {@codelink MinQuery} instance) containing the new content.
     *        Additionaly, the new content may be a function that will be
     *        invoked on each element, {@code this} will be set to the current
     *        element and the element index and HTML content will be passed as
     *        arguments. The function may return any of the previous options
     *        for a content.
     * @param {(string|Element|Array)=} additionalContent An HTML string,
     *        element or an array of elements (or a {@codelink MinQuery}
     *        instance) representing even more content to insert.
     * @return {MinQuery} This collection.
     */
    after: function (content, additionalContent) {
      this.forEach(function (element, index) {
        var contentFragment = prepareContent(
          element,
          index,
          content,
          additionalContent
        );

        element.parentNode.insertBefore(contentFragment, element.nextSibling);
      });

      return this;
    },

    /**
     * Inserts the provided content at the end of the content of each element
     * in this collection.
     *
     * @param {(string|Element|Array|function(index, string): (string|Element|Array))}
     *        content An HTML string defining the new content, the HTML
     *        element that is the new content, or an array (or a
     *        {@codelink MinQuery} instance) containing the new content.
     *        Additionaly, the new content may be a function that will be
     *        invoked on each element, {@code this} will be set to the current
     *        element and the element index and HTML content will be passed as
     *        arguments. The function may return any of the previous options
     *        for a content.
     * @param {(string|Element|Array)=} additionalContent An HTML string,
     *        element or an array of elements (or a {@codelink MinQuery}
     *        instance) representing even more content to insert.
     * @return {MinQuery} This collection.
     */
    append: function (content, additionalContent) {
      this.forEach(function (element, index) {
        var contentFragment = prepareContent(
          element,
          index,
          content,
          additionalContent
        );

        element.appendChild(contentFragment);
      });

      return this;
    },

    /**
     * Creates a deep clone of the elements in this collection. The data are
     * always copied deeply (unlike jQuery) because MinQuery stores the data in
     * the data- attributes of the element instead of a private cache.
     *
     * @param {boolean=} withEvents When {@code true}, the event handlers are
     *        copied too. Defaults to {@code false}.
     * @param {boolean=} deepWithEvents When {@code true}, the event handlers
     *        of the children of the copied elements are copied too. Defaults
     *        to the value of the {@code withEvents} parameter.
     */
    clone: function (withEvents, deepWithEvents) {
      withDataAndEvents = !!withDataAndEvents;
      if (arguments.length < 2) {
        deepWithDataAndEvents = withDataAndEvents;
      }

      var clones = this.map(function (element) {
        var clone = element.clone(true);
        if (withDataAndEvents) {
          cloneEventHandlers(element, clone, deepWithDataAndEvents);
          cloneBoundEventHandlers(element, clone, deepWithDataAndEvents);
        }
        return clone;
      });

      return new MinQuery(clones);
    },

    /**
     * Removes the elements in this collection matching the specified selector
     * from the DOM without removing their event handlers from them.
     *
     * @param {string=} selector Optional filtering CSS selector.
     * @return {MinQuery} This collection.
     */
    detach: function (selector) {
      this.forEach(function (element) {
        if (selector && !element.matches(selector)) {
          return;
        }

        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });

      return this;
    },

    /**
     * Inserts the provided content at the beginning of the content of each
     * element in this collection.
     *
     * @param {(string|Element|Array|function(index, string): (string|Element|Array))}
     *        content An HTML string defining the new content, the HTML
     *        element that is the new content, or an array (or a
     *        {@codelink MinQuery} instance) containing the new content.
     *        Additionaly, the new content may be a function that will be
     *        invoked on each element, {@code this} will be set to the current
     *        element and the element index and HTML content will be passed as
     *        arguments. The function may return any of the previous options
     *        for a content.
     * @param {(string|Element|Array)=} additionalContent An HTML string,
     *        element or an array of elements (or a {@codelink MinQuery}
     *        instance) representing even more content to insert.
     * @return {MinQuery} This collection.
     */
    prepend: function (content, additionalContent) {
      this.forEach(function (element, index) {
        var contentFragment = prepareContent(
          element,
          index,
          content,
          additionalContent
        );

        element.insertBefore(contentFragment, element.firstChild);
      });

      return this;
    },

    /**
     * Removes the elements in this collection matching the specified selector
     * from the DOM and removes any event handlers registered on these
     * elements.
     *
     * @param {string=} selector Optional filtering CSS selector.
     * @return {MinQuery} This collection.
     */
    remove: function (selector) {
      this.detach(selector);

      this.forEach(function (element) {
        if (selector && !element.matches(selector)) {
          return;
        }

        elementsToEvents.delete(element);
      });

      return this;
    },

    /**
     * Replaces the elements in this collection with the provided new content.
     * The elements are removed and all event handlers registered on them are
     * removed.
     *
     * @param {(string|Element|Array|function(number): (string|Element|Array)}
     *        newContent An HTML string defining the new content, the HTML
     *        element that is the new content, or an array (or a
     *        {@codelink MinQuery} instance) containing the new content.
     *        Additionaly, the new content may be a function that will be
     *        invoked on each element, {@code this} will be set to the current
     *        element and the element index will be passed as an argument. The
     *        function may return any of the previous options for a content.
     * @return {MinQuery} This collection.
     */
    replaceWith: function (newContent) {
      if (!(newContent instanceof Function)) {
        var newContentValue = newContent;
        newContent = function () {
          return newContentValue;
        };
      }

      this.forEach(function (element, index) {
        var replacingContent = new MinQuery(newContent.call(element, index));
        (new MinQuery(element)).after(replacingContent).remove();
      });

      return this;
    },

    /**
     * Wraps each element in the collection in the specified HTML structure.
     *
     * @param {(string|Element|Array|function(number): (string|Element|Array))}
     *        wrapper The CSS selector selecting the element to use as a
     *        wrapper, or an HTML string containing the element to use as a
     *        wrapper, or the element to use as a wrapper, or a
     *        {@codelink MinQuery} (or {@code Array}) instance containing the
     *        element to use as a wrapper.
     *        Additionaly, the wrapper may be a function that will be invoked
     *        for each element, {@code this} will be set to the current element
     *        and the element index will be passed as an argument. The function
     *        may return any of the previous options for a wrapper.
     * @return {MinQuery} This collection.
     */
    wrap: function (wrapper) {
      if (!(wrapper instanceof Function)) {
        var wrapperValue = wrapper;
        wrapper = function () {
          return wrapperValue;
        };
      }

      this.forEach(function (element, index) {
        var elementWrapper = new MinQuery(wrapper.call(element, index));
        (new MinQuery(element)).after(elementWrapper);
        elementWrapper.append(element);
      });

      return this;
    }
  };

  /**
   * Generates the content for insertion for the specified element.
   *
   * @param {Element} element The element for which the content is being
   *        generated.
   * @param {number} index The index of the element in the collection
   *        containing the element.
   * @param {(string|Element|Array|function(index, string): (string|Element|Array))}
   *        content An HTML string defining the new content, the HTML element
   *        that is the new content, or an array (or a {@codelink MinQuery}
   *        instance) containing the new content.
   *        Additionaly, the new content may be a function that will be invoked
   *        on each element, {@code this} will be set to the current element
   *        and the element index and HTML content will be passed as arguments.
   *        The function may return any of the previous options for a content.
   * @param {(string|Element|Array)=} additionalContent An HTML string, element
   *        or an array of elements (or a {@codelink MinQuery} instance)
   *        representing even more content to insert.
   * @return {DocumentFragment} A document fragment containing the generated
   *         content.
   */
  function prepareContent(element, index, content, additionalContent) {
    if (!(content instanceof Function)) {
      var contentValue = content;
      content = function () {
        return contentValue;
      };
    }

    var contentFragment = document.createDocumentFragment();

    html = element.innerHTML;
    var newContent = new MinQuery(content.call(element, index, html));
    newContent.forEach(function (newContentElement) {
      contentFragment.appendChild(newContentElement);
    });

    if (additionalContent) {
      (new MinQuery(additionalContent)).forEach(function (newElement) {
        contentFragment.appendChild(newElement);
      });
    }

    return contentFragment;
  }

  /**
   * Clones the event handlers of the provided source element (originally
   * registered using the {@code on()} or {@code one()} method) to the provided
   * target element.
   *
   * @param {Element} source The source element from which the handlers should
   *        be copied.
   * @param {Element} target The target element to which the handlers should be
   *        copied.
   * @param {boolean} deep Set to {@code true} if the event handlers should be
   *        copied also on the children of the source element.
   */
  function cloneEventHandlers(source, target, deep) {
    if (!elementsToEvents.has(source)) {
      return;
    }

    var descriptor = elementsToEvents.get(source);
    var wrappedTarget = new MinQuery(target);

    descriptor.forEach(function (handlerDescriptors, event) {
      handlerDescriptors.forEach(function (handlerDescriptor) {
        copyEventHandler(event, handlerDescriptor, wrappedTarget);
      });
    });

    if (deep) {
      [].slice.call(source.children).forEach(function (child, index) {
        cloneEventHandlers(child, target.children[index], deep);
      });
    }
  }

  /**
   * Copies the provided event handler for the specified event (originally
   * registered using the {@code on()} or {@code one()} method) to the provided
   * event target (HTML element).
   *
   * @param {string} event The name of the event.
   * @param {Object} descriptor Event handler descriptor (see the
   *        {@code elementsToEvents} map in the {@code private} module).
   * @param {MinQuery} target MinQuery-wrapped HTML element on which the event
   *        handler will be registered.
   */
  function copyEventHandler(event, descriptor, target) {
    var eventAndNamespaces = event;
    if (descriptor.namespaces.length) {
      eventAndNamespaces += "." + descriptor.namespaces.join(".");
    }

    var registerer;
    if (descriptor.once) {
      registerer = target.one.bind(target, eventAndNamespaces);
    } else {
      registerer = target.on.bind(target, eventAndNamespaces);
    }

    var handler;
    if (descriptor.isFalseHandler) {
      handler = false;
    } else {
      handler = descriptor.handler;
    }

    if (descriptor.hasOwnProperty("selector")) {
      if (descriptor.hasOwnProperty("data")) {
        registerer(descriptor.selector, descriptor.data, handler);
      } else {
        registerer(descriptor.selector, handler);
      }
    } else if (descriptor.hasOwnProperty("data")) {
      registerer(descriptor.data, handler);
    } else {
      registerer(handler);
    }
  }

  /**
   * Clones the event handlers of the provided source element (originally
   * registered using the {@code bind()} method) to the provided target
   * element.
   *
   * @param {Element} source The source element from which the handlers should
   *        be copied.
   * @param {Element} target The target element to which the handlers should be
   *        copied.
   * @param {boolean} deep Set to {@code true} if the event handlers should be
   *        copied also on the children of the source element.
   */
  function cloneBoundEventHandlers(source, target, deep) {
    if (!elementsToBoundEvents.has(source)) {
      return;
    }

    var descriptor = elementsToBoundEvents.get(source);
    var wrappedTarget = new MinQuery(target);
    descriptor.forEach(function (handlerDescriptors, event) {
      handlerDescriptors.forEach(function (handlerDescriptor) {
        copyBoundEventHandler(event, handlerDescriptor, wrappedTarget);
      });
    });

    if (deep) {
      [].slice.call(source.children).forEach(function (child, index) {
        cloneBoundEventHandlers(child, target.children[index], deep);
      });
    }
  }

  /**
   * Copies the provided event handler for the specified event (originally
   * registered using the {@code bind()} method) to the provided event target
   * (HTML element).
   *
   * @param {string} event The name of the event.
   * @param {Object} descriptor Event handler descriptor (see the
   *        {@code elementsToBoundEvents} map in the {@code private} module).
   * @param {MinQuery} target MinQuery-wrapped HTML element on which the event
   *        handler will be registered.
   */
  function copyBoundEventHandler(event, descriptor, target) {
    var eventAndNamespaces = event;
    if (descriptor.namespaces.length) {
      eventAndNamespaces += "." + descriptor.namespaces.join(".");
    }

    var handler;
    if (descriptor.isFalseHandler) {
      handler = false;
    } else {
      handler = descriptor.handler;
    }

    if (descriptor.hasOwnProperty("data")) {
      target.bind(eventAndNamespaces, descriptor.data, handler);
    } else {
      target.bind(eventAndNamespaces, handler);
    }
  }
});

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

MinQueryLoader.define("events", ["MinQuery", "private"],
    function (MinQuery, privateData) {
  "use strict";

  var elementsToEvents = privateData.elementsToEvents;
  var elementsToBoundEvents = privateData.elementsToBoundEvents;

  return {
    /**
     * Binds the provided event handler to be executed whenever one of the
     * specified events occur on any of the elements of this collection.
     *
     * Multiple event names may be specified by separating them using
     * whitespace.
     *
     * An event may contain also any number of namespaces to which the handler
     * will be added - those can be used to group the handler and then unbind
     * the whole group by specifying the namespace(s). A namespace name is a
     * string without whitespace prefix with a dot (.). The namespaces must be
     * specified with the event by appending the concatenated names of
     * namespaces to the event name. For example, to attach an event handler
     * for the {@code click} event and add the handler to the {@code foo} and
     * {@code bar} namespaces, use the following string as event name:
     * {@code click.foo.bar}.
     *
     * The handler may return a boolean value. If the handler returns
     * {@code false}, the captured event will have its default action prevented
     * and the propagation of the event will be stopped.
     *
     * @param {(Object<string, (boolean|function(Event): ?boolean)>|string)}
     *        eventType The names of events and namespaces, or a map of event
     *        names and namespaces to the handlers to register.
     * @param {*=} data Optional data to pass to the event handler in
     *        {@code event.data}.
     * @param {(function(Event): ?boolean|boolean=)} handler The handler to
     *        register. If set to {@code false}, an empty event handler that
     *        returns {@code false} will be generated. Defaults to {@code true}
     *        (no effect).
     * @return {MinQuery} This collection.
     */
    bind: function (eventType, data, handler) {
      if ((arguments.length === 1) && (typeof eventType === "object")) {
        Object.keys(eventType).forEach(function (event) {
          this.bind(event, undefined, eventType[event]);
        }.bind(this));

        return this;
      }

      if (arguments.length === 2) {
        handler = data;
        data = undefined;
      }

      eventType.trim().split(/\s+/).forEach(function (eventWithNamespaces) {
        var event = eventWithNamespaces;
        var namespaces = [];
        if (eventWithNamespaces.indexOf(".") > -1) {
          var parts = eventWithNamespaces.split(".");
          event = parts.shift();
          namespaces = parts;
        }

        this.forEach(function (element) {
          bindEventHandler(element, event, namespaces, data, handler);
        });
      }.bind(this));

      return this;
    },

    /**
     * Unregisters the specified event handler from execution on the specified
     * events happening on the elements of this collection, or children
     * matching the specified selector.
     *
     * See the {@codelink on()} method on details about event namespaces.
     *
     * @param {(Event|string)} events Whitespace-separated list of event names
     *        and optional namespaces, or an example event.
     * @param {(undefined|string)} selector The selector filtering the children
     *        that may cause the handler to execute on the specified events.
     *        Use {@code "**"} to match all selectors (except for cases when
     *        the selector was not specified).
     * @param {(boolean|function(Event, ...*): ?boolean)} handler The event
     *        handler to unregister, or {@code false} to represent the
     *        generated handler that just returns {@code false}.
     */
    off: function (events, selector, handler) {
      if (!arguments.length) {
        var events = getAllListenedForEvents(this, elementsToEvents);
        events.forEach(function (event) {
          this.off(event);
        }.bind(this));

        return this;
      }

      if (events instanceof Event) {
        return this.unbind(events.type);
      }

      var isArg2Handler = (selector instanceof Function) ||
          (selector === false);
      if ((arguments.length < 3) && !isArg2Handler) {
        var handlers = getEventHandlers(this, events, selector);
        handlers.forEach(function (handler) {
          this.off(events, selector, handler);
        }.bind(this));
        return this;
      }

      if (arguments.length < 3) {
        handler = selector;
        selector = undefined;
      }

      events.trim().split(/\s+/).forEach(function (eventWithNamespaces) {
        var event = eventWithNamespaces;
        var namespaces = [];
        if (eventWithNamespaces.indexOf(".") > -1) {
          var parts = eventWithNamespaces.split(".");
          event = parts.shift();
          namespaces = parts;
        }

        this.forEach(function (element) {
          removeEventHandler(element, event, namespaces, selector, handler);
        });
      });
    },

    /**
     * Registers the provided event handler to be executed whenever one of the
     * specified events occur on any of the elements of this collection.
     *
     * Multiple event names may be specified by separating them using
     * whitespace.
     *
     * An event may contain also any number of namespaces to which the handler
     * will be added - those can be used to group the handler and then unbind
     * the whole group by specifying the namespace(s). A namespace name is a
     * string without whitespace prefix with a dot (.). The namespaces must be
     * specified with the event by appending the concatenated names of
     * namespaces to the event name. For example, to attach an event handler
     * for the {@code click} event and add the handler to the {@code foo} and
     * {@code bar} namespaces, use the following string as event name:
     * {@code click.foo.bar}.
     *
     * The handler may return a boolean value. If the handler returns
     * {@code false}, the captured event will have its default action prevented
     * and the propagation of the event will be stopped.
     *
     * @param {(Object<string, (boolean|function(Event): ?boolean)>|string)}
     *        eventType The names of events and namespaces, or a map of event
     *        names and namespaces to the handlers to register.
     * @param {string=} selector An optional filtering selector that filter the
     *        children of the element on which the event will be observed.
     * @param {*=} data Optional data to pass to the event handler in
     *        {@code event.data} and handler argument. If an array, the array
     *        will be expanded to handler arguments.
     * @param {(function(Event): ?boolean|boolean=)} handler The handler to
     *        register. If set to {@code false}, an empty event handler that
     *        returns {@code false} will be generated. Defaults to {@code true}
     *        (no effect).
     * @return {MinQuery} This collection.
     */
    on: function (events, selector, data, handler) {
      onOrOne.call(null, [this, false].concat([].slice.call(arguments)));
      return this;
    },

    /**
     * Registers the provided event handler to be executed once one of the
     * specified events occur on any of the elements of this collection. The
     * event handler will be executed only once for each of the specified
     * events, then it will be automatically unregistered.
     *
     * Multiple event names may be specified by separating them using
     * whitespace.
     *
     * An event may contain also any number of namespaces to which the handler
     * will be added - those can be used to group the handler and then unbind
     * the whole group by specifying the namespace(s). A namespace name is a
     * string without whitespace prefix with a dot (.). The namespaces must be
     * specified with the event by appending the concatenated names of
     * namespaces to the event name. For example, to attach an event handler
     * for the {@code click} event and add the handler to the {@code foo} and
     * {@code bar} namespaces, use the following string as event name:
     * {@code click.foo.bar}.
     *
     * The handler may return a boolean value. If the handler returns
     * {@code false}, the captured event will have its default action prevented
     * and the propagation of the event will be stopped.
     *
     * @param {(Object<string, (boolean|function(Event): ?boolean)>|string)}
     *        eventType The names of events and namespaces, or a map of event
     *        names and namespaces to the handlers to register.
     * @param {string=} selector An optional filtering selector that filter the
     *        children of the element on which the event will be observed.
     * @param {*=} data Optional data to pass to the event handler in
     *        {@code event.data} and handler argument. If an array, the array
     *        will be expanded to handler arguments.
     * @param {(function(Event): ?boolean|boolean=)} handler The handler to
     *        register. If set to {@code false}, an empty event handler that
     *        returns {@code false} will be generated. Defaults to {@code true}
     *        (no effect).
     * @return {MinQuery} This collection.
     */
    one: function (events, selector, data, handler) {
      onOrOne.call(null, [this, true].concat([].slice.call(arguments)));
      return this;
    },

    /**
     * Sets the specified callback to be executed when the document parsing is
     * done. If the document parsing is already finished, the callback is
     * asynchronously executed as soon as possible.
     *
     * @param {function()} callback The callback to execute.
     * @return {MinQuery} This collection.
     */
    ready: function (callback) {
      if ((this.length !== 1) || (this[0] !== document)) {
        throw new Error("The ready() method can only be executed when the " +
            "MinQuery collection contains only the document");
      }

      if (["interactive", "complete"].indexOf(document.readyState) > -1) {
        setTimeout(callback, 0);
      } else {
        addEventListener("DOMContentLoaded", function () {
          callback();
        }, false);
      }

      return this;
    },

    /**
     * Triggers the event handlers registerd on the elements of this collection
     * for the specified event. The method only triggers the registerd events
     * handlers, it does not actually trigger the event on the elements.
     *
     * @param {string} eventType The type of the event to trigger.
     * @param {(Array|*)} extraParameters Additional arguments to pass to the
     *        event handler. If set to an array, the array is expanded to
     *        separate arguments.
     * @return {*} The value returned by the last executed event handler, or
     *         {@code undefined} if no event handler was triggered.
     */
    triggerHandler: function (eventType, extraParameters) {
      var result = undefined;
      var event = new CustomEvent(eventType);

      this.forEach(function (element) {
        [
          elementsToEvents,
          elementsToBoundEvents
        ].forEach(function (elementsToEvents) {
          var descriptors = getHandlerDescriptors(elementsToEvents, element,
            eventType, false);
          descriptors.forEach(function (descriptor) {
            results = triggerHandler(descriptor, element, event,
                extraParameters);
          });
        });
      });

      return result;
    },

    /**
     * Unbinds the specified handler, registered to be executed on the
     * specified event, from the elements in this collection.
     *
     * When invoked without parameters, the method removes all handlers for all
     * events.
     *
     * @param {(Event|string)=} eventType The name of event for which the
     *        handler should be removed, or an {@code Event} object - the
     *        handler will be removed of events of the {@code Event} object's
     *        type. The event name may contain namespaces to restrain the
     *        group of handlers that will be removed (see the {@code bind()}
     *        method).
     * @param {(boolean|function(Event): ? boolean)=} handler The handler to
     *        unregister, or {@code false} if the generated handler that just
     *        returns {@code false} should be unregistered.
     *        If ommitted, the method removes all event handlers for the
     *        specified event.
     * @return {MinQuery} This collection.
     */
    unbind: function (eventType, handler) {
      if (!arguments.length) {
        var events = getAllListenedForEvents(this, elementsToBoundEvents);
        events.forEach(function (event) {
          this.unbind(event);
        }.bind(this));

        return this;
      }

      if (eventType instanceof Event) {
        return this.unbind(eventType.type);
      }

      if (arguments.length === 1) {
        if (eventType.charAt(0) === ".") {
          var events = getAllListenedForEvents(this, elementsToBoundEvents);
          events.forEach(function (event) {
            this.unbind(event + eventType);
          }.bind(this));

          return this;
        }

        this.forEach(function (element) {
          unbindAllBoundListeners(element, eventType);
        });

        return this;
      }

      this.forEach(function (element) {
        unbindBoundListener(element, eventType, handler);
      });

      return this;
    }
  };

  /**
   * Triggers the specified event handler on the provided element using the
   * provided event.
   *
   * @param {Object} descriptor Event handler descriptor.
   * @param {Element} element The element on which the event handler is
   *        triggered.
   * @param {Event} event The event to pass to the handler.
   * @param {(Array|*)} extraParams Additional arguments to pass to the event
   *        handler. If set to an array, the array is expanded to separate
   *        arguments.
   * @return {*} The return value of the handler.
   */
  function triggerHandler(descriptor, element, event, extraParams) {
    var handler = descriptor.handler;
    event.target = element;

    var result;
    if (extraParams instanceof Array) {
      result = handler.apply(element, [event].concat(extraParams));
    } else {
      result = handler.call(element, event, extraParams);
    }

    if (descriptor.once) {
      var eventWithNamespaces = event.type;
      if (descriptor.namespaces.length) {
        eventWithNamespaces += "." + descriptor.namespaces.join(".");
      }
      var selector = descriptor.selector;
      (new MinQuery(element)).off(eventWithNamespaces, selector, handler);
    }

    return result;
  }

  /**
   * Removes the specified event handler for the specified event, matching the
   * specified namespaces and selector, from handlers of the specified event on
   * the provided element.
   *
   * If the selector is {@code "**"}, the handler is removed for all selector
   * values (except for {@code undefined).
   *
   * @param {Element} element The element being the event target.
   * @param {string} event The name of the event.
   * @param {string[]} namespaces Names of namespaces the handler is part of.
   *        When set to an empty array, namespaces are ignored.
   * @param {(undefined|string)} selector The selector provided when the
   *        handler was registered, or {@code "**"} to match all non-empty
   *        selectors.
   * @param {(boolean|function(Event, ...*): ?boolean)} handler The event
   *        handler or {@code false} to represent the generated simple handler
   *        that just returns {@code false}.
   */
  function removeEventHandler(element, event, namespaces, selector, handler) {
    var descriptors = getHandlerDescriptors(elementsToEvents, element, event,
        false);
    if (selector === "**") {
      descriptors.map(function (descriptor) {
        return descriptor.selector;
      }).filter(function (selector) {
        return !!selector;
      }).forEach(function (selector) {
        removeEventHandler(element, event, namespaces, selector, handler);
      });
      return;
    }

    var descriptorIndex = -1;
    descriptors.some(function (descriptor, index) {
      if (descriptor.selector !== selector) {
        return;
      }

      if (namespaces.length) {
        var found = descriptor.namespaces.some(function (namespace) {
          return namespaces.indexof(namespace) > -1;
        });
        if (!found) {
          return;
        }
      }

      var matched = ((handler === false) && descriptor.isFalseHandler) ||
          (handler === descriptor.handler);

      if (matched) {
        descriptorIndex = index;
        return true;
      }
    });
    if (descriptorIndex === -1) {
      return;
    }

    var descriptor = descriptors[descriptorIndex];
    element.removeEventListener(event, descriptor, false);
    descriptors.splice(descriptorIndex, 1);

    // when treating multiple/all namespaces, we must check multiple times
    removeEventHandler(element, event, namespaces, selector, handler);
  }

  /**
   * Retrieves all event handlers registered on all of the provided elements
   * for the specified events (and optionaly filtered by namespaces), and set
   * for the specified selector.
   *
   * @param {MinQuery} elements Collection of elements.
   * @param {string} eventsWithNamespaces Names of events, with optional
   *        namespaces.
   * @param {(undefined|string)} selector The selector. If {@code undefined},
   *        the function returns only handlers that has no selector specified.
   *        Use {@code "**"} to match any selector (except for
   *        {@code undefined}).
   * @return {(false|function(Event, ...*): ?boolean)[]} The retrieved event
   *         handlers, as provided by the client code.
   */
  function getEventHandlers(elements, eventsWithNamespaces, selector) {
    if (/\s/.match(eventsWithNamespaces.trim())) {
      var allHandlers = [];
      var parts = eventsWithNamespaces.trim().split(/\s+/);
      parts.forEach(function (eventWithNamespaces) {
        allHandlers = allHandlers.concat(getEventHandlers(
          elements,
          eventWithNamespaces,
          selector
        ));
      });
      return allHandlers;
    }

    var event = eventsWithNamespaces;
    var namespaces = [];
    if (eventsWithNamespaces.indexOf(".") > -1) {
      var parts = eventsWithNamespaces.split(".");
      event = parts.shift();
      namespaces = parts;
    }

    var handlers = [];

    elements.forEach(function (element) {
      var descriptors = getHandlerDescriptors(elementsToEvents, element, event,
          false);
      descriptors.forEach(function (descriptor) {
        if (descriptor.selector !== selector) {
          if ((selector !== "**") || (descriptor.selector === undefined)) {
            return;
          }
        }

        if (namespaces.length) {
          var found = namespaces.some(function (namespace) {
            return descriptor.namespaces.indexof(namespace) > -1;
          });
          if (!found) {
            return;
          }
        }

        if (descriptor.isFalseHandler) {
          handlers.push(false);
        } else {
          handlers.push(descriptor.handler);
        }
      });
    });

    return handlers;
  }

  /**
   * Registers the provided event handler to be executed whenever one of the
   * specified events occur on any of the elements of this collection.
   *
   * Multiple event names may be specified by separating them using whitespace.
   *
   * An event may contain also any number of namespaces to which the handler
   * will be added - those can be used to group the handler and then unbind the
   * whole group by specifying the namespace(s). A namespace name is a string
   * without whitespace prefix with a dot (.). The namespaces must be specified
   * with the event by appending the concatenated names of namespaces to the
   * event name. For example, to attach an event handler for the {@code click}
   * event and add the handler to the {@code foo} and {@code bar} namespaces,
   * use the following string as event name: {@code click.foo.bar}.
   *
   * The handler may return a boolean value. If the handler returns
   * {@code false}, the captured event will have its default action prevented
   * and the propagation of the event will be stopped.
   *
   * @param {MinQuery} elements The collection of elements on which the event
   *        handler should be registered.
   * @param {boolean} one If {@code true}, the handler will be automatically
   *        unregistered after first execution.
   * @param {(Object<string, (boolean|function(Event): ?boolean)>|string)}
   *        eventType The names of events and namespaces, or a map of event
   *        names and namespaces to the handlers to register.
   * @param {string=} selector An optional filtering selector that filter the
   *        children of the element on which the event will be observed.
   * @param {*=} data Optional data to pass to the event handler in
   *        {@code event.data} and handler argument. If an array, the array
   *        will be expanded to handler arguments.
   * @param {(function(Event): ?boolean|boolean=)} handler The handler to
   *        register. If set to {@code false}, an empty event handler that
   *        returns {@code false} will be generated. Defaults to {@code true}
   *        (no effect).
   * @return {MinQuery} This collection.
   */
  function onOrOne(elements, one, events, selector, data, handler) {
    if (events instanceof Object) {
      if ((arguments.length < 5) && (typeof selector !== "string")) {
        data = selector;
        selector = undefined;
      }

      Object.keys(events).forEach(function (event) {
        this.on(event, selector, data, events[event]);
      }.bind(this));

      return this;
    }

    if (arguments.length < 6) {
      handler = arguments[arguments.length - 1];
      arguments[arguments.length - 1] = undefined;

      if (typeof selector !== "string") {
        data = selector;
        selector = undefined;
      }
    }

    events.trim().split(/\s+/).forEach(function (eventWithNamespaces) {
      var event = eventWithNamespaces;
      var namespaces = [];
      if (eventWithNamespaces.indexOf(".") > -1) {
        var parts = eventWithNamespaces.split(".");
        event = parts.shift();
        namespaces = parts;
      }

      this.forEach(function (element) {
        addEventHandler(element, event, namespaces, selector, data, handler,
            one);
      });
    });

    return this;
  }

  /**
   * Adds the provided handler to be executed when the specified event occurs
   * on the element, or, if the selector is specified, on the children of the
   * element that match the selector.
   *
   * The handler will be invoked with the provided data, and will be
   * unregistered if the {@code once} flag is set.
   *
   * @param {Element} element The element on which the event will be listened
   *        for.
   * @param {string} event The name of the event to listen for.
   * @param {string[]} namespaces The event handler namespaces.
   * @param {(undefined|string)} selector The selector the children of the
   *        element must match for the event handler to be executed if the
   *        event occurs on them.
   * @param {*} data The data to pass to the handler.
   * @param {(boolean|function(Event, ...*): ?boolean} The event handler, or
   *        {@code false} if a simple event handler returning {@code false}
   *        should be generated.
   * @param {boolean} once Set to {@code true} if the handler should be
   *        unregistered after being executed.
   */
  function addEventHandler(element, event, namespaces, selector, data, handler,
      once) {
    var descriptor = createEventHandlerDescriptor(event, namespaces, selector,
        data, handler, once);

    element.addEventListener(event, descriptor.realHandler, false);

    var eventHandlers = getHandlerDescriptors(elementsToEvents, element, event,
        true);

    eventHandlers.push(descriptor);
  }

  /**
   * Unbinds the provided event handler from the provided element registered to
   * be executed on the specified event. The handler is also removed from the
   * internal registry of bound event handlers.
   *
   * @param {Element} element The element that should have its event handler
   *        unbound.
   * @param {string} eventType The name of the event for which the event
   *        handler should be removed.The event name may contain namespaces to
   *        restrain the group of handlers that will be removed (see the
   *        {@code bind()} method).
   * @param {(boolean|function(Event): ?boolean} handler The event handler to
   *        unregister.
   */
  function unbindBoundListener(element, eventType, handler) {
    if (!elementsToBoundEvents.has(element)) {
      return;
    }

    var event = eventType;
    var namespaces = [];
    if (eventType.indexof(".") > -1) {
      var parts = eventType.split(".");
      event = parts.shift();
      namespaces = parts;
    }

    var descriptors = getHandlerDescriptors(elementsToBoundEvents, element,
        event, false);
    var descriptorIndex = getIndexOfEventDescriptor(descriptors, handler,
        namespaces);
    if (descriptorIndex === -1) {
      return;
    }

    var descriptor = descriptors[descriptorIndex];
    element.removeEventListener(event, descriptor.realHandler, false);
    descriptors.splice(descriptorIndex, 1);

    // when treating multiple/all namespaces, we must check multiple times
    unbindBoundListener(element, eventType, handler);
  }

  /**
   * Returns the index of the event handler descriptor from the provided array
   * of event handler descriptors for the specified handler and having at least
   * one of the specified namespaces.
   *
   * If the provided namespaces are an empty arry, the namespaces of event
   * handler descriptors are ignored.
   *
   * @param {Object[]} descriptors Event handler descriptors to search.
   * @param {(false|function(Event, ...*): ?boolean} handler The event handler,
   *        as provided by the client code.
   * @param {string[]} namespaces The namespaces the handler is a part of.
   * @return {number} The index of the found event handler descriptor, or -1 if
   *         no such event handler descriptor was found.
   */
  function getIndexOfEventDescriptor(descriptors, handler, namespaces) {
    var descriptorIndex = -1;

    descriptors.some(function (descriptor, index) {
      var found = ((handler === false) && descriptor.isFalseHandler) ||
          (descriptor.handler === handler);

      if (!found) {
        return false;
      }

      if (namespaces.length) {
        var hasNamespace = namespaces.some(function (namespace) {
          return descriptor.namespaces.indexOf(namespace) > -1;
        });
        if (!hasNamespace) {
          return false;
        }
      }

      descriptorIndex = index;

      return true;
    });

    return descriptorIndex;
  }

  /**
   * Unbinds all event handlers that were bound to the element for the
   * specified event using the {@code bind()} method. The handlers are also
   * removed from the internal registry of bound event handlers.
   *
   * @param {Element} element The element that should have its event handlers
   *        unbound.
   * @param {string} eventType The name of the event for which the event
   *        handlers should be removed.
   */
  function unbindAllBoundListeners(element, eventType) {
    if (!elementsToBoundEvents.has(element)) {
      return;
    }

    var elementEventHandlers = elementsToBoundEvents.get(element);
    if (!elementEventHandlers.has(eventType)) {
      return;
    }

    var descriptors = elementEventHandlers.get(eventType);
    descriptors.forEach(function (descriptor) {
      if (descriptor.isFalseHandler) {
        (new MinQuery(element)).unbind(eventType, false);
      } else {
        (new MinQuery(element)).unbind(eventType, descriptor.handler);
      }
    });
  }

  /**
   * Retrieves all events the elements in the provided collection listner for.
   *
   * @param {MinQuery} elements A collection of elements.
   * @return {string[]} The names of events observed by the elements of the
   *         collection.
   */
  function getAllListenedForEvents(elements, elementsToEventsMap) {
    var events = [];

    elements.forEach(function (element) {
      if (!elementsToEventsMap.has(element)) {
        return;
      }

      elementsToEventsMap.get(element).forEach(function (_, event) {
        if (events.indexOf(event) > - 1) {
          return;
        }

        events.push(event);
      });
    });

    return events;
  }

  /**
   * Adds the provided handler to the provided element to be executed on the
   * specified event. The method then registers the handler with the private
   * registry of bound event handlers.
   *
   * @param {Element} element The element on which the event should be
   *        observed.
   * @param {string} event The name of the event to observe.
   * @param {string[]} namespaces The namespaces the handler is a part of.
   * @param {*} data Data to pass to the event handler in {@code event.data}.
   * @param {(boolean|function(Event): ?boolean)} handler The handler to
   *        register, or {@code false} to generate an empty handler returning
   *        {@code false}. When set to other non-function value, then function
   *        has no effect.
   */
  function bindEventHandler(element, event, namespaces, data, handler) {
    var descriptor = createEventHandlerDescriptor(event, namespaces, undefined,
        data, handler, undefined);

    element.addEventListener(event, descriptor.realHandler, false);

    var eventHandlers = getHandlerDescriptors(elementsToBoundEvents, element,
        event, true);

    eventHandlers.push(descriptor);
  }

  /**
   * Retrieves the event handler descriptors for the specified element and
   * event from the provided event handler descriptors map.
   *
   * @param {WeakMap<Element, Map<string, Object[]>>} elementsToEventsMap A map
   *        of elements to a map of event names to an array of event handler
   *        descriptor objects.
   * @param {Element} element The element for which the handler descriptors
   *        should be retrieved.
   * @param {string} event The name of the event for which the handler
   *        descriptors should be retrieved.
   * @param {boolean} create If {@code true}, the structures in the map will be
   *        created if they do not exist already. If {@code false}, and the
   *        structures for the element and event do not exist, the method
   *        returns an empty array without modifying the map.
   * @return {Object[]} Retrieved array of event handler descriptors.
   */
  function getHandlerDescriptors(elementsToEventsMap, element, event, create) {
    var elementEvents = elementsToEventsMap.get(element);
    if (!elementEvents) {
      elementEvents = new Map();
      if (create) {
        elementsToEventsMap.set(element, elementEvents);
      }
    }

    var descriptors = elementEvents.get(event);
    if (!descriptors) {
      descriptors = [];
      if (create) {
        elementEvents.set(event, descriptors);
      }
    }

    return descriptors;
  }

  /**
   * Creates an event handler descriptor object.
   *
   * @param {string} event The name of the event listened for.
   * @param {string[]} namespaces Namespaces of the handler.
   * @param {(undefined|string)} selector The selector restricting the
   *        children of the element on which an event occurrence will lead to
   *        handler execution.
   * @param {*} data Additional data passed to the event handler.
   * @param {(boolean|function (Event, ...*): ?boolean)} handler The event
   *        handler to execute when the event occurs, or {@code false} if a
   *        simple event handler that just returns {@code false} should be
   *        generated.
   * @param {boolean} once Set to {@code true} if the event handler can be
   *        executed only once and then destroyed.
   * @return {Object} Event handler descriptor object.
   */
  function createEventHandlerDescriptor(event, namespaces, selector, data,
      handler, once) {
    var isSimpleFalseHandler = false;
    if (!(handler instanceof Function)) {
      if (handler === false) {
        isSimpleFalseHandler = true;
        handler = function () {
          return false;
        };
      } else {
        return; // nothing to do
      }
    }

    var realHandler = createRealEventHandler(event, namespaces, selector, data,
        handler, once);
    var descriptor = {
      namespaces: Object.freeze(namespaces),
      isFalseHandler: isSimpleFalseHandler,
      handler: handler,
      realHandler: realHandler
    };
    if (selector !== undefined) {
      descriptor.selector = selector;
    }
    if (data !== undefined) {
      descriptor.data = data;
    }
    if (once !== undefined) {
      descriptor.once = once;
    }

    return Object.freeze(descriptor);
  }

  /**
   * Creates an actual event handler that will be passed to the low-level DOM
   * events API.
   *
   * @param {string} event The name of the event listened for.
   * @param {string[]} namespaces Namespaces of the handler.
   * @param {(undefined|string)} selector The selector restricting the
   *        children of the element on which an event occurrence will lead to
   *        handler execution.
   * @param {*} data Additional data passed to the event handler.
   * @param {function (Event, ...*): ?boolean} handler The event handler to
   *        execute when the event occurs.
   * @param {boolean} once Set to {@code true} if the event handler can be
   *        executed only once and then destroyed.
   */
  function createRealEventHandler(event, namespaces, selector, data, handler,
      once) {
    return function (event) {
      if (selector !== undefined) {
        if (!event.target.matches(selector)) {
          return;
        }
      }

      if (data !== undefined) {
        event.data = data;
      }

      var result;
      if (data instanceof Array) {
        result = handler.apply(element, [event].concat(data));
      } else {
        result = handler.call(element, event, data);
      }

      if (result === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (once) {
        var eventWithNamespaces = event;
        if (namespaces.length) {
          eventWithNamespaces += "." + namespaces.join(".");
        }
        if (selector !== undefined) {
          (new MinQuery(element)).off(eventWithNamespaces, selector, handler);
        } else {
          (new MinQuery(element)).off(eventWithNamespaces, handler);
        }
      }
    };
  }
});

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

MinQueryLoader.define("private", [], function () {
  "use strict";

  return {
    /**
     * Map of elements to the-event-name-to-handler-descriptors map for the
     * element. This map contains only the event handlers registered using the
     * {@code on()} and {@code one()} methods. The map keys are event names
     * (excluding namespaces), the values are arrays of event handler
     * descriptors.
     *
     * An event handler descriptor is an object with the following fields:
     * - namespaces: string[] - namespaces the event handler belongs to.
     * - selector: string= - optional selector that must be matched by the
     *   event target for the handler to execute.
     * - data: *= - optional data to pass to the event handler. If an array,
     *   the array will be expanded into separate arguments passed to the
     *   handler.
     * - isFalseHandler: boolean - set to {@code true} if the client code
     *   specified {@code false} as the handler.
     * - handler - function(Event, ...*): ?boolean - the handler to execute.
     *   When the handler returns {@code false}, the default browser action
     *   will be prevented and event propagation will be stopped.
     * - once: boolean - {@code true} if the handler is executed only once and
     *   then discarded.
     * - realHandler - function(Event) - the low-level event handler that has
     *   been passed to the DOM events API.
     *
     * @type {WeakMap<Element, Map<string, Object[]>>}
     */
    elementsToEvents: new WeakMap(),

    /**
     * Map of elements to the-event-name-to-handler-descriptors map for the
     * element. This map contains only the event handlers registered using the
     * {@code bind()} method. The map keys are event names (excluding
     * namespaces), the values are arrays of event handler descriptors.
     *
     * An event handler descriptor is an object with the following fields:
     * - namespaces: string[] - namespaces the event handler belongs to.
     * - data: *= - optional data to pass to the event handler. If array, the
     *   array will be expanded into separate arguments passed to the handler.
     * - isFalseHandler: boolean - set to {@code true} if the client code
     *   specified {@code false} as the handler.
     * - handler - function(Event): ?boolean - the handler to execute.
     *   When the handler returns {@code false}, the default browser action
     *   will be prevented and event propagation will be stopped.
     * - realHandler - function(Event) - the low-level event handler that has
     *   been passed to the DOM events API.
     *
     * @type {WeakMap<Element, Map<string, Object[]>>}
     */
    elementsToBoundEvents: new WeakMap()
  };
});

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

var MinQuery = (function (loader) {
  "use strict";

  var extensions = [
    "attributes-manipulation",
    "collection-manipulation",
    "content-manipulation",
    "css-classes",
    "data-manipulation",
    "dom-manipulation",
    "dom-traversing",
    "events",
    "forms",
    "property-manipulation"
  ];

  var MinQuery = loader.get("MinQuery");

  extensions.forEach(function (extensionName) {
    var extension = loader.get(extensionName);
    Object.keys(extension).forEach(function (methodName) {
      MinQuery.prototype[methodName] = extension[methodName];
    });
  });

  if (typeof define === "function") {
    define([], function () {
      return MinQuery;
    });
  }

  return MinQuery;

}(MinQueryLoader));
  return MinQuery;
}());
