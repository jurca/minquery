# minQuery
Alternative jQuery implementation containing only the basic API.

**This project is nothing but a coding excercise. It is NOT intended for use in
any project, it is only for fun.**

**Do not bother issuing bug reports. They will be ignored.**

**Pull requests *might* be accepted.**

Rules of the coding excercise:
- implement all APIs provided by Angular's
  [jqLite](https://docs.angularjs.org/api/ng/function/angular.element)
- implement the aforementioned APIs to be 100% compatible with jQuery 2.0
- no polyfills, no transpilers, just plain ECMAScript 5
- no external libraries that would have to be loaded into the browser
- must be compatible with the evergreen browsers (Chromium 40 is enough) at the
  moment of completion
- extend the `Array` class (for practical reasons)
- `MinQuery("body")` is all that has to be tested and work, the rest of API
  must be implemented and syntactically correct
- no unit tests, regression tests or other automated tests are neccessary
