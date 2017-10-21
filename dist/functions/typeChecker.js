'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isReferenceArray = exports.isAttributeArray = exports.isReference = exports.isIdentificator = exports.isAttribute = undefined;

var _Model = require('../Model');

var isAttribute = exports.isAttribute = function isAttribute(type) {
    var attributeKeys = [_Model.types.String.type, _Model.types.Number.type, _Model.types.Boolean.type];
    return attributeKeys.includes(type.type);
};

var isIdentificator = exports.isIdentificator = function isIdentificator(type) {
    return type.type === _Model.types.Identificator.type;
};

var isReference = exports.isReference = function isReference(type) {
    return type.type === _Model.types.Reference().type;
};

var isAttributeArray = exports.isAttributeArray = function isAttributeArray(type) {
    return type.type === _Model.types.Array().type && type.arrayOfType.type !== _Model.types.Reference().type;
};

var isReferenceArray = exports.isReferenceArray = function isReferenceArray(type) {
    return type.type === _Model.types.Array().type && type.arrayOfType.type === _Model.types.Reference().type;
};