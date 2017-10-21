'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.transformReferenceArray = exports.transformReference = exports.transformAttribute = undefined;
exports.default = createObservable;

var _Model = require('../Model');

var _typeChecker = require('./typeChecker');

var transformAttribute = exports.transformAttribute = function transformAttribute(attribute) {
    return attribute;
};

var transformReference = exports.transformReference = function transformReference(reference) {
    var isNumber = function isNumber(v) {
        return typeof v === 'number' || v instanceof Number;
    };
    if (isNumber(reference)) {
        // reference by id
        return reference;
    } else if (!reference) {
        // nullate relation
        return null;
    } else if (reference.id)
        // reference by entity
        return reference.id;else
        // whatever else is shit
        return null;
};

var transformReferenceArray = exports.transformReferenceArray = function transformReferenceArray(array) {
    if (Array.isArray(array)) return array.map(function (it) {
        return transformReference(it);
    });else return [];
};

var setObservableAttribute = function setObservableAttribute(item, key, type, stateProvider, updateState, store) {
    Object.defineProperty(item, key, {
        get: function get() {
            return stateProvider()[key];
        },
        set: function set(value) {
            stateProvider()[key] = transformAttribute(value);
            updateState();
        }
    });
};

var setObservableReference = function setObservableReference(item, key, type, stateProvider, updateState, store) {
    var subscriber = null;
    Object.defineProperty(item, key, {
        get: function get() {
            var referenceID = stateProvider()[key];
            if (referenceID) return store.models[type.model].observe(referenceID);
            return null;
        },
        set: function set(value) {
            if (subscriber) subscriber.unsubscribe();

            var referenceID = transformReference(value);
            stateProvider()[key] = referenceID;

            if (referenceID) {
                subscriber = store.subscribeEntity(type.model, referenceID).subscribe(function (_) {
                    updateState();
                });
            }
            updateState();
        }
    });
};

var setObservableReferenceArray = function setObservableReferenceArray(item, key, type, stateProvider, updateState, store) {
    var subscribers = [];
    Object.defineProperty(item, key, {
        get: function get() {
            var referenceIDS = stateProvider()[key];
            return referenceIDS.map(function (id) {
                return store.models[type.arrayOfType.model].observe(id);
            });
        },
        set: function set(value) {
            subscribers.forEach(function (it) {
                return it.unsubscribe();
            });
            var transformedArray = transformReferenceArray(value);
            stateProvider()[key] = transformedArray;
            subscribers = transformedArray.map(function (id) {
                return store.subscribeEntity(type.arrayOfType.model, id).subscribe(function (_) {
                    updateState();
                });
            });
            updateState();
        }
    });
};

var setFreezedId = function setFreezedId(item, value) {
    Object.defineProperty(item, 'id', {
        get: function get() {
            return value;
        },
        set: function set(value) {
            // ignore set, it's immutable
        }
    });
};

var collectObservable = function collectObservable(observable, structure, deepness) {
    var json = {};
    Object.keys(structure).forEach(function (key) {
        if ((0, _typeChecker.isAttribute)(structure[key])) {
            json[key] = observable[key];
        } else if ((0, _typeChecker.isReference)(structure[key])) {
            if (observable[key] && deepness > 0) {
                json[key] = observable[key].$json(deepness - 1);
            } else {
                json[key] = null;
            }
        } else if ((0, _typeChecker.isReferenceArray)(structure[key])) {
            json[key] = deepness > 0 && observable[key].map(function (it) {
                if (it) {
                    return it.$json(deepness - 1);
                } else {
                    return null;
                }
            }) || [];
        } else if ((0, _typeChecker.isAttributeArray)(structure[key])) {
            json[key] = observable[key];
        } else if ((0, _typeChecker.isIdentificator)(structure[key])) {
            json[key] = observable[key];
        } else {
            // console.log(JSON.stringify(structure), key, observable)
            json[key] = collectObservable(observable[key], structure[key], deepness);
        }
    });
    return json;
};

var createObservableObject = function createObservableObject() {
    var reactiveItem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var structure = arguments[1];
    var stateProvider = arguments[2];
    var updateState = arguments[3];
    var store = arguments[4];

    Object.keys(structure).forEach(function (key) {
        if ((0, _typeChecker.isAttribute)(structure[key])) {
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if ((0, _typeChecker.isReference)(structure[key])) {
            setObservableReference(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if ((0, _typeChecker.isAttributeArray)(structure[key])) {
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if ((0, _typeChecker.isReferenceArray)(structure[key])) {
            setObservableReferenceArray(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if ((0, _typeChecker.isIdentificator)(structure[key])) {
            setFreezedId(reactiveItem, reactiveItem["id"]);
        } else {
            reactiveItem[key] = {};
            createObservableObject(reactiveItem[key], structure[key], function () {
                return stateProvider()[key];
            }, updateState, store);
        }
    });
    reactiveItem.$json = function () {
        var deepness = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

        return collectObservable(reactiveItem, structure, deepness);
    };

    return reactiveItem;
};

var merge = function merge(structure, objectToMerge, stateProvider, updateState) {
    Object.keys(objectToMerge).forEach(function (key) {
        if ((0, _typeChecker.isAttribute)(structure[key])) {
            stateProvider()[key] = transformAttribute(objectToMerge[key]);
        } else if ((0, _typeChecker.isReference)(structure[key])) {
            stateProvider()[key] = transformReference(objectToMerge[key]);
        } else if ((0, _typeChecker.isAttributeArray)(structure[key])) {
            stateProvider()[key] = transformAttribute(objectToMerge[key]);
        } else if ((0, _typeChecker.isReferenceArray)(structure[key])) {
            stateProvider()[key] = transformReferenceArray(objectToMerge[key]);
        } else {
            merge(structure[key], objectToMerge[key], function () {
                return stateProvider()[key];
            }, updateState);
        }
    });
};

function createObservable() {
    var reactiveItem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var structure = arguments[1];
    var stateProvider = arguments[2];
    var updateState = arguments[3];
    var store = arguments[4];

    createObservableObject(reactiveItem, structure, stateProvider, updateState, store);
    reactiveItem.$merge = function (objectToMerge) {
        merge(structure, objectToMerge, stateProvider, updateState);
        updateState();
    };
    return reactiveItem;
}