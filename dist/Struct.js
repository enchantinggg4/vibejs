'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _Model = require('./Model');

var _setComputedProperty = require('./functions/setComputedProperty');

var _setComputedProperty2 = _interopRequireDefault(_setComputedProperty);

var _createObservable = require('./functions/createObservable');

var _createObservable2 = _interopRequireDefault(_createObservable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Struct = function () {
    function Struct() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { structure: {}, computed: {} };
        var store = arguments[1];

        _classCallCheck(this, Struct);

        this.computed = options.computed || {};
        this.structure = options.structure || {};
        this.store = store;
        this.state = {};
    }

    _createClass(Struct, [{
        key: 'defaultStructure',
        value: function defaultStructure(structure) {
            var _this = this;

            var skeleton = {};
            Object.keys(structure).forEach(function (key) {
                if (structure[key].type == _Model.types.Identificator.type) {} else if (structure[key].type == _Model.types.Reference().type) {
                    skeleton[key] = structure[key].default();
                } else if (structure[key].type == _Model.types.String.type) {
                    skeleton[key] = structure[key].default();
                } else if (structure[key].type == _Model.types.Number.type) {
                    skeleton[key] = structure[key].default();
                } else if (structure[key].type == _Model.types.Boolean.type) {
                    skeleton[key] = structure[key].default();
                } else if (structure[key].type == _Model.types.Array().type) {
                    skeleton[key] = structure[key].default();
                } else {
                    skeleton[key] = _this.defaultStructure(structure[key]);
                }
            });
            return skeleton;
        }
    }, {
        key: 'observe',
        value: function observe() {
            var _this2 = this;

            this.state = this.defaultStructure(this.structure);
            var observable = new _Rx2.default.Subject();

            var reactiveItem = (0, _createObservable2.default)({}, this.structure, function () {
                return _this2.state;
            }, function () {
                return observable.next();
            }, this.store);

            Object.defineProperty(reactiveItem, "$observable", {
                get: function get() {
                    return observable;
                },
                set: function set() {}
            });

            Object.keys(this.computed).forEach(function (key) {
                (0, _setComputedProperty2.default)(reactiveItem, key, _this2.computed[key]);
            });
            return reactiveItem;
        }
    }]);

    return Struct;
}();

exports.default = Struct;