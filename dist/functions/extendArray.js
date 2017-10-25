"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (arrayToExtend, onNewArray) {
    arrayToExtend.push = function (item) {
        var newArray = arrayToExtend.concat([item]);
        onNewArray(newArray);
    };
};