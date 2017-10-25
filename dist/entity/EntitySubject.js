'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _typeChecker = require('../functions/typeChecker');

var TypeChecker = _interopRequireWildcard(_typeChecker);

var _Mutation = require('./Mutation');

var _Mutation2 = _interopRequireDefault(_Mutation);

var _isNumber = require('is-number');

var _isNumber2 = _interopRequireDefault(_isNumber);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(name, id, observable, model, store) {
        var _this = this;

        _classCallCheck(this, _class);

        this.name = name;
        this.id = id;
        this.model = model;
        this.observable = observable;
        this.store = store;
        this.subscriptions = {};
        Object.entries(store.models).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                key = _ref2[0],
                value = _ref2[1];

            _this.subscriptions[key] = {};
        });

        this.interface = this.createReactiveInterface();

        this.subscriptions[name][id] = this.observable.filter(function (_ref3) {
            var payload = _ref3.payload,
                source = _ref3.source;
            return source !== _this;
        });
        this.subscriptions[name][id].subscribe(function (_ref4) {
            var payload = _ref4.payload,
                source = _ref4.source;

            _this.updateInterface();
        }, function (error) {}, function (complete) {});
    }

    _createClass(_class, [{
        key: 'updateInterface',
        value: function updateInterface() {
            this.interface = this.createReactiveInterface();
        }
    }, {
        key: 'mutate',
        value: function mutate(mutation) {
            var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

            if (this.store.heap[this.name][this.id]) {
                new _Mutation2.default(this, mutation).commit(message);
            } else {
                throw new Error('Trying to modify not existing entity');
            }
        }
    }, {
        key: 'createReactiveInterface',
        value: function createReactiveInterface() {
            var _this2 = this;

            if (this.store.heap[this.name][this.id]) {
                var get = function get(key) {
                    if (_this2.store.heap[_this2.name][_this2.id]) return _this2.store.heap[_this2.name][_this2.id][key];else throw new Error('Trying to read not existing entity');
                };
                var set = function set(key, value) {
                    _this2.mutate(_defineProperty({}, key, value), 'Modify ' + key + ' with value ' + value);
                };
                var reactiveInterface = {};
                this._mapObserverToSource(reactiveInterface, this.model.structure, {
                    get: get,
                    set: set
                });
                this._applyComputed(reactiveInterface);
                this._applyMutations(reactiveInterface);
                return reactiveInterface;
            } else {
                return null;
            }
        }
    }, {
        key: '_applyComputed',
        value: function _applyComputed(reactiveInterface) {
            Object.entries(this.model.computed).forEach(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    key = _ref6[0],
                    value = _ref6[1];

                reactiveInterface[key] = value.call(reactiveInterface);
            });
        }
    }, {
        key: '_applyMutations',
        value: function _applyMutations(reactiveInterface) {
            Object.entries(this.model.mutations).forEach(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    key = _ref8[0],
                    value = _ref8[1];

                reactiveInterface[key] = value.bind(reactiveInterface);
            });
        }
    }, {
        key: '_processReference',
        value: function _processReference(value, stateProvider) {
            if ((0, _isNumber2.default)(value)) {
                return value;
            } else if (value == null) {
                return value;
            } else if ('id' in value && (0, _isNumber2.default)(value.id)) {
                return value.id;
            } else {
                throw new Error("Invalid reference: expected id, null or subject");
            }
        }
    }, {
        key: '_mapObserverToSource',
        value: function _mapObserverToSource() {
            var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var _this3 = this;

            var structure = arguments[1];
            var stateProvider = arguments[2];

            var store = this.store;
            var entitySubject = this;
            Object.entries(structure).forEach(function (_ref9) {
                var _ref10 = _slicedToArray(_ref9, 2),
                    key = _ref10[0],
                    value = _ref10[1];

                if (TypeChecker.isAttribute(structure[key])) {
                    Object.defineProperty(item, key, {
                        get: function get() {
                            return stateProvider.get(key);
                        },
                        set: function set(value) {
                            stateProvider.set(key, value);
                        }
                    });
                } else if (TypeChecker.isReference(structure[key])) {
                    var relationName = structure[key].model;
                    var relationID = stateProvider.get(key);
                    var initialSubject = null;
                    if (relationID) {
                        initialSubject = store.getOrCreateEntitySubject(relationName, relationID);
                        if (entitySubject.isSubscriberOf(relationName, relationID)) {} else {
                            entitySubject.subscribe(relationName, relationID)(function (_ref11) {
                                var payload = _ref11.payload,
                                    source = _ref11.source;

                                store.entityUpdated(entitySubject.name, entitySubject.id, source);
                            });
                        }
                    }
                    Object.defineProperty(item, key, {
                        get: function get() {
                            return _ramda2.default.path(['interface'], initialSubject);
                        },
                        set: function set(value) {
                            if (initialSubject) {
                                entitySubject.unsubscribe(relationName, initialSubject.id);
                            }

                            var refID = entitySubject._processReference(value, stateProvider);
                            stateProvider.set(key, refID);
                            if (refID) {
                                initialSubject = store.getOrCreateEntitySubject(relationName, refID);
                                entitySubject.subscribe(relationName, refID)(function (_ref12) {
                                    var payload = _ref12.payload,
                                        source = _ref12.source;

                                    store.entityUpdated(entitySubject.name, entitySubject.id, source);
                                });
                            }
                        }
                    });
                } else if (TypeChecker.isAttributeArray(structure[key])) {
                    Object.defineProperty(item, key, {
                        get: function get() {
                            return stateProvider.get(key);
                        },
                        set: function set(value) {
                            stateProvider.set(key, value);
                        }
                    });
                } else if (TypeChecker.isReferenceArray(structure[key])) {
                    var _relationName = structure[key].arrayOfType.model;
                    var relationIDs = stateProvider.get(key);
                    var subjects = [];
                    subjects = relationIDs.map(function (relationID) {
                        var subject = store.getOrCreateEntitySubject(_relationName, relationID);
                        if (entitySubject.isSubscriberOf(_relationName, relationID)) {} else {
                            entitySubject.subscribe(_relationName, relationID)(function (_ref13) {
                                var payload = _ref13.payload,
                                    source = _ref13.source;

                                store.entityUpdated(entitySubject.name, entitySubject.id, source);
                            });
                        }
                        return subject;
                    });
                    Object.defineProperty(item, key, {
                        get: function get() {
                            return subjects.map(function (it) {
                                return it.interface;
                            });
                        },
                        set: function set(relationIDs) {
                            subjects.forEach(function (subject) {
                                entitySubject.unsubscribe(_relationName, subject.id);
                            });
                            subjects = relationIDs.map(function (value) {
                                var refID = entitySubject._processReference(value, stateProvider);
                                if (refID) {
                                    var _initialSubject = store.getOrCreateEntitySubject(_relationName, refID);
                                    entitySubject.subscribe(_relationName, refID)(function (_ref14) {
                                        var payload = _ref14.payload,
                                            source = _ref14.source;

                                        store.entityUpdated(entitySubject.name, entitySubject.id, source);
                                    });
                                    return _initialSubject;
                                }
                            });
                            stateProvider.set(key, subjects.map(function (it) {
                                return it.id;
                            }));
                        }
                    });
                } else if (TypeChecker.isIdentifier(structure[key])) {
                    Object.defineProperty(item, key, {
                        get: function get() {
                            return entitySubject.id;
                        },
                        set: function set(value) {}
                    });
                } else {
                    var get = function get(key2) {
                        if (stateProvider.get(key)) return stateProvider.get(key)[key2];else throw new Error('Trying to read not existing entity');
                    };
                    var set = function set(key2, value) {
                        stateProvider.set(key, _defineProperty({}, key2, value));
                    };
                    var wrappedItem = {};
                    _this3._mapObserverToSource(wrappedItem, structure[key], {
                        get: get,
                        set: set
                    });
                    item[key] = wrappedItem;
                }
            });
        }
    }, {
        key: 'equals',
        value: function equals(entitySubject) {
            return this === entitySubject;
        }
    }, {
        key: 'isSubscriberOf',
        value: function isSubscriberOf(name, id) {
            return this.subscriptions[name][id];
        }
    }, {
        key: 'subscribe',
        value: function subscribe(name, id) {
            var _this4 = this;

            return function (a, b, c) {
                _this4.subscriptions[name][id] = _this4.store.getOrCreateEntitySubject(name, id).observable.filter(function (_ref15) {
                    var payload = _ref15.payload,
                        source = _ref15.source;
                    return source !== _this4;
                }).subscribe(a, b, c);
            };
        }
    }, {
        key: 'unsubscribe',
        value: function unsubscribe(name, id) {
            if (this.subscriptions[name][id]) {
                this.subscriptions[name][id].unsubscribe();
            }
            delete this.subscriptions[name][id];
        }
    }, {
        key: 'toString',
        value: function toString() {
            return '"' + this.name + '.' + this.id + '"';
        }
    }]);

    return _class;
}();

exports.default = _class;