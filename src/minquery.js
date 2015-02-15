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
