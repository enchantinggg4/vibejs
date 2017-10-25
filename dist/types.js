'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    Attribute: {
        type: 'Attribute',
        default: function _default() {
            return null;
        }
    },
    Identifier: {
        type: 'Identifier'
    },
    Array: function (_Array) {
        function Array(_x) {
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