'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isReferenceArray = exports.isAttributeArray = exports.isReference = exports.isIdentifier = exports.isAttribute = undefined;

var _types = require('../types');

var _types2 = _interopRequireDefault(_types);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isAttribute = exports.isAttribute = function isAttribute(type) {
    return _types2.default.Attribute.type === type.type;
};

var isIdentifier = exports.isIdentifier = function isIdentifier(type) {
    return type.type === _types2.default.Identifier.type;
};

var isReference = exports.isReference = function isReference(type) {
    return type.type === _types2.default.Reference().type;
};

var isAttributeArray = exports.isAttributeArray = function isAttributeArray(type) {
    return type.type === _types2.default.Array().type && type.arrayOfType.type !== _types2.default.Reference().type;
};

var isReferenceArray = exports.isReferenceArray = function isReferenceArray(type) {
    return type.type === _types2.default.Array().type && type.arrayOfType.type === _types2.default.Reference().type;
};