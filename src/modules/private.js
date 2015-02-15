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
