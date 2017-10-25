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

var _types = require('../types');

var _types2 = _interopRequireDefault(_types);

var _typeChecker = require('../functions/typeChecker');

var TypeChecker = _interopRequireWildcard(_typeChecker);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = function () {
    function Model(name) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { structure: {}, computed: {}, mutations: {} };

        _classCallCheck(this, Model);

        this.name = name;
        this.computed = options.computed || {};
        this.structure = options.structure || {};
        this.mutations = options.mutations || {};
        this.structure.id = _types2.default.Identificator;
        this.store = null;
    }

    _createClass(Model, [{
        key: 'attachStore',
        value: function attachStore(store) {
            this.store = store;
        }
    }, {
        key: 'fillDefaultValues',
        value: function fillDefaultValues(structure, item) {
            var _this = this;

            Object.entries(structure).forEach(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    key = _ref2[0],
                    value = _ref2[1];

                if (TypeChecker.isAttribute(structure[key])) {
                    if (!(key in item)) item[key] = structure[key].default();
                } else if (TypeChecker.isReference(structure[key])) {
                    if (!(key in item)) item[key] = structure[key].default();
                } else if (TypeChecker.isReferenceArray(structure[key])) {
                    if (!(key in item)) item[key] = structure[key].default();
                } else if (TypeChecker.isAttributeArray(structure[key])) {
                    if (!(key in item)) item[key] = structure[key].default();
                } else if (TypeChecker.isIdentificator(structure[key])) {
                    // we check this already
                } else {
                    if (!(key in item)) item[key] = {};
                    _this.fillDefaultValues(structure[key], item[key]);
                }
            });
        }
    }, {
        key: 'insertEntity',
        value: function insertEntity(id, item) {
            if (id) {
                var emptyItem = {};
                this.fillDefaultValues(this.structure, emptyItem);
                this.fillDefaultValues(this.structure, item);
                this.store.putEntity(this.name, id, emptyItem);
                this.store.putEntity(this.name, id, item);
            } else {
                throw new Error("Entity's id cannot be null or zero");
            }
        }
    }, {
        key: 'observe',
        value: function observe(id) {
            if (this.store) {
                return this.store.getOrCreateEntitySubject(this.name, id);
            } else {
                throw new Error('Model ' + this.name + ' is not attached to a store.');
            }
        }
    }]);

    return Model;
}();

exports.default = Model;