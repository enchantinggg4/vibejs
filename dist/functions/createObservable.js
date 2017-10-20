'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = createObservable;

var _Model = require('../Model');

var setObservableAttribute = function setObservableAttribute(item, key, type, stateProvider, updateState, store) {
    Object.defineProperty(item, key, {
        get: function get() {
            return stateProvider()[key];
        },
        set: function set(value) {
            stateProvider()[key] = value;
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

            var isNumber = function isNumber(v) {
                return typeof v === 'number' || v instanceof Number;
            };
            if (isNumber(value)) {
                // reference by id
                stateProvider()[key] = value;
            } else if (!value) {
                // nullate relation
                stateProvider()[key] = null;
            } else {
                if (value.id) stateProvider()[key] = value.id;else throw new Error("Expected object with identificator, got", value);
            }

            var referenceID = stateProvider()[key];

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
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    stateProvider()[key] = [];
                } else {
                    stateProvider()[key] = value.map(function (item) {
                        var isNumber = function isNumber(v) {
                            return typeof v === 'number' || v instanceof Number;
                        };
                        if (isNumber(item)) {
                            //set by id
                            return item;
                        } else if (!item) {
                            return null;
                        } else {
                            return item.id;
                        }
                    });
                }
            } else {
                throw new Error("Expected array got ", value);
            }
            subscribers = stateProvider()[key].map(function (id) {
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

var setObservableObject = function setObservableObject(item, key, stateProvider, updateState, store) {
    createObservable(item[key]);
};

function createObservable() {
    var reactiveItem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var structure = arguments[1];
    var stateProvider = arguments[2];
    var updateState = arguments[3];
    var store = arguments[4];

    Object.keys(structure).forEach(function (key) {
        if (structure[key].type === _Model.types.Reference().type) {
            setObservableReference(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === _Model.types.Array().type && structure[key].arrayOfType.type === _Model.types.Reference().type) {
            // todo array methods proxy
            setObservableReferenceArray(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === _Model.types.Array().type && structure[key].arrayOfType.type !== _Model.types.Reference().type) {
            // todo array methods proxy
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === _Model.types.Identificator.type) {
            setFreezedId(reactiveItem, reactiveItem["id"]);
        } else if (structure[key].type === _Model.types.String.type) {
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === _Model.types.Number.type) {
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === _Model.types.Boolean.type) {
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else {
            reactiveItem[key] = createObservable({}, structure[key], function () {
                return stateProvider()[key];
            }, updateState, store);
        }
    });
    reactiveItem.$json = function () {
        var _this = this;

        var json = {};
        Object.keys(structure).forEach(function (key) {
            if (structure[key].type === 'Reference') {
                if (_this[key]) {
                    json[key] = _this[key].$json();
                } else {
                    json[key] = null;
                }
            } else if (structure[key].type === 'Array' && structure[key].arrayOfType.type === _Model.types.Reference().type) {
                json[key] = _this[key].map(function (it) {
                    if (it) {
                        return it.$json();
                    } else {
                        return null;
                    }
                });
            } else if (_this[key].$json) {
                json[key] = _this[key].$json();
            } else {
                json[key] = reactiveItem[key];
            }
        });
        return json;
    };
    return reactiveItem;
}