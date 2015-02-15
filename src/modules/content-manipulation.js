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
