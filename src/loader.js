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
