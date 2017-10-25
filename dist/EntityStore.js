'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _EntitySubject = require('./entity/EntitySubject');

var _EntitySubject2 = _interopRequireDefault(_EntitySubject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(models) {
        _classCallCheck(this, _class);

        this.modelsArray = models;
        this.models = {};
        this.heap = {};
        this.observables = {};
        this.setupModelsAndHeap(models);
    }

    _createClass(_class, [{
        key: 'updateEntity',
        value: function updateEntity(name, id, value, source) {
            var message = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

            this.heap[name][id] = value;
            this.entityUpdated(name, id, source);
        }
    }, {
        key: 'setupModelsAndHeap',
        value: function setupModelsAndHeap(models) {
            var _this = this;

            models.forEach(function (model) {
                _this.models[model.name] = model;
                _this.heap[model.name] = {};
                _this.observables[model.name] = {};
                model.attachStore(_this);
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.setupModelsAndHeap(this.modelsArray);
        }
    }, {
        key: 'putEntity',
        value: function putEntity(name, id, value) {
            this.heap[name][id] = value;
            this.getOrCreateEntitySubject(name, id).updateInterface();
        }
    }, {
        key: 'deleteEntity',
        value: function deleteEntity(name, id) {
            delete this.heap[name][id];
            this.getOrCreateEntitySubject(name, id).updateInterface();
        }
    }, {
        key: 'getOrCreateEntitySubject',
        value: function getOrCreateEntitySubject(name, id) {
            var observable = this.observables[name][id];
            if (observable) return observable;else return this.createEntitySubject(name, id);
        }
    }, {
        key: 'createEntitySubject',
        value: function createEntitySubject(name, id) {
            this.observables[name][id] = new _EntitySubject2.default(name, id, new _Rx2.default.Subject(), this.models[name], this);
            return this.observables[name][id];
        }
    }, {
        key: 'entityUpdated',
        value: function entityUpdated(name, id, source) {
            this.getOrCreateEntitySubject(name, id).observable.next({
                payload: this.heap[name][id],
                source: source
            });
        }
    }]);

    return _class;
}();

exports.default = _class;