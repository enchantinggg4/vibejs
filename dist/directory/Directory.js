'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _setComputedProperty = require('../functions/setComputedProperty');

var _setComputedProperty2 = _interopRequireDefault(_setComputedProperty);

var _typeChecker = require('../functions/typeChecker');

var TypeChecker = _interopRequireWildcard(_typeChecker);

var _Model = require('../entity/Model');

var _DirectorySubject = require('./DirectorySubject');

var _DirectorySubject2 = _interopRequireDefault(_DirectorySubject);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Directory = function () {
    function Directory(name) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { structure: {}, computed: {} };
        var store = arguments[2];

        _classCallCheck(this, Directory);

        this.name = name;
        this.computed = options.computed || {};
        this.structure = options.structure || {};
        this.computed = options.computed || {};
        this.mutations = options.mutations || {};
        this.store = store;
        this.state = {};
        this.initialState(this.structure, this.state);
        this.subject = new _DirectorySubject2.default(this, store);
    }

    _createClass(Directory, [{
        key: 'clear',
        value: function clear() {
            this.state = {};
            this.initialState(this.structure, this.state);
        }
    }, {
        key: 'initialState',
        value: function initialState(structure, state) {
            var _this = this;

            Object.entries(structure).forEach(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    key = _ref2[0],
                    value = _ref2[1];

                if (TypeChecker.isAttribute(structure[key])) {
                    state[key] = structure[key].default();
                } else if (TypeChecker.isAttributeArray(structure[key])) {
                    state[key] = [];
                } else if (TypeChecker.isReference(structure[key])) {
                    state[key] = null;
                } else if (TypeChecker.isReferenceArray(structure[key])) {
                    state[key] = [];
                } else {
                    //object
                    state[key] = {};
                    _this.initialState(structure[key], state[key]);
                }
            });
        }
    }, {
        key: 'observe',
        value: function observe() {
            return this.subject;
        }
    }]);

    return Directory;
}();

exports.default = Directory;