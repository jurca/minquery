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
