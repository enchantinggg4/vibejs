'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.types = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _setComputedProperty = require('./functions/setComputedProperty');

var _setComputedProperty2 = _interopRequireDefault(_setComputedProperty);

var _createObservable = require('./functions/createObservable');

var _createObservable2 = _interopRequireDefault(_createObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = function () {
    function Model(name) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { structure: {}, computed: {} };

        _classCallCheck(this, Model);

        this.name = name;
        this.computed = options.computed || {};
        this.structure = options.structure || {};
        this.store = null;
        this.structure.id = types.Identificator;
    }

    _createClass(Model, [{
        key: 'attachStore',
        value: function attachStore(store) {
            this.store = store;
        }
    }, {
        key: 'insertEntity',
        value: function insertEntity(item) {
            var _this = this;

            var validation = this.validateItem(item, this.structure);
            if (validation) {
                Object.keys(this.structure).forEach(function (key) {
                    if (!item[key]) item[key] = _this.structure[key].default();
                });
                this.store.pushToHeap(this.name, item);
            } else {
                throw new Error("Wrong json structure for model " + this.name);
            }
        }
    }, {
        key: 'validateKeyValue',
        value: function validateKeyValue(structure, key, value) {
            if (structure[key].type === types.Identificator.type && types.Identificator.check(value)) {
                return true;
            } else if (structure[key].type === types.String.type && types.String.check(value)) {
                return true;
            } else if (structure[key].type === types.Number.type && types.Number.check(value)) {
                return true;
            } else if (structure[key].type === types.Boolean.type && types.Boolean.check(value)) {
                return true;
            } else if (structure[key].type === types.Array().type && structure[key].check(value)) {
                return true;
            } else if (structure[key].type === types.Reference().type && types.Reference().check(value)) {
                return true;
            } else {
                return this.validateItem(value, structure[key]);
            }
        }
    }, {
        key: 'validateItem',
        value: function validateItem(item, structure) {
            var _this2 = this;

            if (item) return Object.keys(item).map(function (key) {
                var value = item[key];
                return _this2.validateKeyValue(structure, key, value);
            }).reduce(function (a, b) {
                return a && b;
            });else return false;
        }
    }, {
        key: 'defaultStructure',
        value: function defaultStructure(structure) {
            var _this3 = this;

            var skeleton = {};
            Object.keys(structure).forEach(function (key) {
                if (structure[key].type == types.Identificator.type) {} else if (structure[key].type == types.Reference().type) {
                    skeleton[key] = structure[key].default();
                } else if (structure[key].type == types.String.type) {
                    skeleton[key] = structure[key].default();
                } else if (structure[key].type == types.Number.type) {
                    skeleton[key] = structure[key].default();
                } else if (structure[key].type == types.Boolean.type) {
                    skeleton[key] = structure[key].default();
                } else if (structure[key].type == types.Array().type) {
                    skeleton[key] = structure[key].default();
                } else {
                    skeleton[key] = _this3.defaultStructure(structure[key]);
                }
            });
            return skeleton;
        }
    }, {
        key: 'observe',
        value: function observe(id) {
            var _this4 = this;

            if (!this.store.entityExists(this.name, id)) this.insertEntity(_extends({
                id: id
            }, this.defaultStructure(this.structure)));

            var observable = new _Rx2.default.Subject();
            var placeholder = {
                id: id
            };

            this.store.subscribeEntity(this.name, id).subscribe(function (value) {
                observable.next(value);
            }, function (err) {
                observable.error(err);
            }, function () {
                observable.complete();
                // clear all subscriptions and just jsonify it
            });

            var reactiveItem = (0, _createObservable2.default)(placeholder, this.structure, function () {
                return _this4.store.heap[_this4.name][id];
            }, function () {
                return _this4.store.updateEntity(_this4.name, id);
            }, this.store);

            reactiveItem.$delete = function () {
                this.store.deleteEntity(this.name, reactiveItem.id);
            }.bind(this);

            Object.keys(this.computed).forEach(function (key) {
                (0, _setComputedProperty2.default)(reactiveItem, key, _this4.computed[key]);
            });
            Object.defineProperty(reactiveItem, "$observable", {
                get: function get() {
                    return observable;
                },
                set: function set() {}
            });

            return reactiveItem;
        }
    }]);

    return Model;
}();

exports.default = Model;
var types = exports.types = {
    String: {
        type: String,
        check: function check(value) {
            return typeof value === 'string' || value instanceof String || !value;
        },
        default: function _default() {
            return "";
        }
    },
    Number: {
        type: Number,
        check: function check(value) {
            return typeof value === 'number' || value instanceof Number || !value;
        },
        default: function _default() {
            return 0;
        }
    },
    Boolean: {
        type: Boolean,
        check: function check(value) {
            return typeof value === 'boolean' || value instanceof Boolean || !value;
        },
        default: function _default() {
            return false;
        }
    },
    Identificator: {
        type: 'Identificator',
        check: function check(value) {
            return typeof value === 'number' || value instanceof Number || !value;
        }
    },
    Array: function (_Array) {
        function Array(_x2) {
            return _Array.apply(this, arguments);
        }

        Array.toString = function () {
            return _Array.toString();
        };

        return Array;
    }(function (Type) {
        return {
            type: 'Array',
            arrayOfType: Type,
            check: function check(value) {
                return Array.isArray(value) && (value.length === 0 || this.arrayOfType.check(value[0]));
            },
            default: function _default() {
                return [];
            }
        };
    }),
    Reference: function Reference(Model) {
        return {
            type: 'Reference',
            model: Model,
            default: function _default() {
                return null;
            },
            check: function check(value) {
                var isNumber = function isNumber(v) {
                    return typeof v === 'number' || v instanceof Number;
                };
                return isNumber(value) || !value || isNumber(value.id);
            }
        };
    }
};