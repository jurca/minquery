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
