'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EntityStore = function () {
    function EntityStore(models) {
        _classCallCheck(this, EntityStore);

        this.models = {};
        this.heap = {};
        this.observables = {};
        this.setupModelsAndHeap(models);
    }

    _createClass(EntityStore, [{
        key: 'setupModelsAndHeap',
        value: function setupModelsAndHeap(models) {
            var _this = this;

            models.forEach(function (element) {
                _this.models[element.name] = element;
                _this.heap[element.name] = {};
                element.attachStore(_this);
            });
        }
    }, {
        key: 'pushToHeap',
        value: function pushToHeap(name, value) {
            this.heap[name][value.id] = value;
            var observable = this.getEntityObservable(name, value.id);
            if (observable) observable.next(this.heap[name][value.id]);
        }
    }, {
        key: 'subscribeEntity',
        value: function subscribeEntity(name, id) {
            if (!this.getEntityObservable(name, id)) return this.createEntityObservable(name, id);
            return this.getEntityObservable(name, id);
        }
    }, {
        key: 'getEntityObservable',
        value: function getEntityObservable(name, id) {
            var observableKey = JSON.stringify({ name: name, id: id });
            return this.observables[observableKey];
        }
    }, {
        key: 'createEntityObservable',
        value: function createEntityObservable(name, id) {
            var observableKey = JSON.stringify({ name: name, id: id });
            this.observables[observableKey] = new _Rx2.default.Subject();
            return this.observables[observableKey];
        }
    }, {
        key: 'updateEntity',
        value: function updateEntity(name, id) {
            var observable = this.getEntityObservable(name, id);
            if (observable) observable.next(this.heap[name][id]);
        }
    }, {
        key: 'entityExists',
        value: function entityExists(name, id) {
            return !!this.heap[name][id];
        }
    }]);

    return EntityStore;
}();

exports.default = EntityStore;