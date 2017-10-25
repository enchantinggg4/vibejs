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

var _DirectoryMutation = require('./DirectoryMutation');

var _DirectoryMutation2 = _interopRequireDefault(_DirectoryMutation);

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _extendArray = require('../functions/extendArray');

var _extendArray2 = _interopRequireDefault(_extendArray);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(directory, store) {
        var _this = this;

        _classCallCheck(this, _class);

        this.directory = directory;
        this.store = store;
        this.subscriptions = {};
        this.observable = new _Rx2.default.Subject();
        Object.entries(store.models).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                key = _ref2[0],
                value = _ref2[1];

            _this.subscriptions[key] = {};
        });

        this.observable.subscribe(function (_) {
            _this.updateInterface();
        });

        this.interface = null;
        this.updateInterface();
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

            new _DirectoryMutation2.default(this, mutation).commit(message);
        }
    }, {
        key: 'update',
        value: function update() {
            this.observable.next();
        }
    }, {
        key: 'createReactiveInterface',
        value: function createReactiveInterface() {
            var _this2 = this;

            var get = function get(key) {
                return _this2.directory.state[key];
            };
            var set = function set(key, value) {
                _this2.mutate(_defineProperty({}, key, value), 'Modify ' + key + ' with value ' + value);
            };
            var reactiveInterface = {};
            this._mapObserverToSource(reactiveInterface, this.directory.structure, {
                get: get,
                set: set
            });
            this._applyComputed(reactiveInterface);
            this._applyMutations(reactiveInterface);
            return reactiveInterface;
        }
    }, {
        key: '_applyComputed',
        value: function _applyComputed(reactiveInterface) {
            Object.entries(this.directory.computed).forEach(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    key = _ref4[0],
                    value = _ref4[1];

                reactiveInterface[key] = value.call(reactiveInterface);
            });
        }
    }, {
        key: '_applyMutations',
        value: function _applyMutations(reactiveInterface) {
            Object.entries(this.directory.mutations).forEach(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    key = _ref6[0],
                    value = _ref6[1];

                reactiveInterface[key] = value.bind(reactiveInterface);
            });
        }
    }, {
        key: '_mapObserverToSource',
        value: function _mapObserverToSource() {
            var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var _this3 = this;

            var structure = arguments[1];
            var stateProvider = arguments[2];

            var store = this.store;
            var directorySubject = this;
            Object.entries(structure).forEach(function (_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2),
                    key = _ref8[0],
                    value = _ref8[1];

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
                        if (directorySubject.isSubscriberOf(relationName, relationID)) {} else {
                            directorySubject.subscribe(relationName, relationID)(function (_ref9) {
                                var payload = _ref9.payload,
                                    source = _ref9.source;

                                directorySubject.update();
                            });
                        }
                    }
                    Object.defineProperty(item, key, {
                        get: function get() {
                            return _ramda2.default.path(['interface'], initialSubject);
                        },
                        set: function set(value) {
                            stateProvider.set(key, value);

                            directorySubject.unsubscribe(relationName, value);

                            initialSubject = store.getOrCreateEntitySubject(relationName, value);
                            directorySubject.subscribe(relationName, value)(function (_ref10) {
                                var payload = _ref10.payload,
                                    source = _ref10.source;

                                store.entityUpdated(directorySubject.name, directorySubject.id, source);
                            });
                        }
                    });
                } else if (TypeChecker.isAttributeArray(structure[key])) {
                    Object.defineProperty(item, key, {
                        get: function get() {
                            var extendedArray = stateProvider.get(key);
                            (0, _extendArray2.default)(extendedArray, function (newArray) {
                                stateProvider.set(key, newArray);
                            });
                            return extendedArray;
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
                        if (directorySubject.isSubscriberOf(_relationName, relationID)) {} else {
                            directorySubject.subscribe(_relationName, relationID)(function (_ref11) {
                                var payload = _ref11.payload,
                                    source = _ref11.source;

                                store.entityUpdated(directorySubject.name, directorySubject.id, source);
                            });
                        }
                        return subject;
                    });
                    Object.defineProperty(item, key, {
                        get: function get() {
                            var extendedArray = subjects.map(function (it) {
                                return it.interface;
                            });
                            extendedArray(extendedArray, function (newArray) {
                                stateProvider.set(key, newArray);
                            });
                            return extendedArray;
                        },
                        set: function set(relationIDs) {
                            stateProvider.set(key, relationIDs);
                            subjects.forEach(function (subject) {
                                directorySubject.unsubscribe(_relationName, subject.id);
                            });

                            subjects = relationIDs.map(function (relationID) {
                                var subject = store.getOrCreateEntitySubject(_relationName, relationID);
                                if (directorySubject.isSubscriberOf(_relationName, relationID)) {} else {
                                    directorySubject.subscribe(_relationName, relationID)(function (_ref12) {
                                        var payload = _ref12.payload,
                                            source = _ref12.source;

                                        store.entityUpdated(directorySubject.name, directorySubject.id, source);
                                    });
                                }
                                return subject;
                            });
                        }
                    });
                } else if (TypeChecker.isIdentificator(structure[key])) {
                    Object.defineProperty(item, key, {
                        get: function get() {
                            return directorySubject.id;
                        },
                        set: function set(value) {}
                    });
                } else {
                    var get = function get(key2) {
                        return stateProvider.get(key)[key2];
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
        value: function equals(directorySubject) {
            return this === directorySubject;
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
                _this4.subscriptions[name][id] = _this4.store.getOrCreateEntitySubject(name, id).observable.filter(function (_ref13) {
                    var payload = _ref13.payload,
                        source = _ref13.source;
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
            return '"#' + this.name + '"';
        }
    }]);

    return _class;
}();

exports.default = _class;