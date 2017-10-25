'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DirectoryMutation = function () {
    function DirectoryMutation(subject, payload) {
        _classCallCheck(this, DirectoryMutation);

        this.subject = subject;
        var originalState = subject.directory.state;
        this.resultState = _ramda2.default.mergeDeepRight(originalState, payload);
    }

    _createClass(DirectoryMutation, [{
        key: 'commit',
        value: function commit(message) {
            this.subject.directory.state = this.resultState;
            this.subject.update();
        }
    }]);

    return DirectoryMutation;
}();

exports.default = DirectoryMutation;