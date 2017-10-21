"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var serializeStore = exports.serializeStore = function serializeStore(store) {
    return JSON.stringify(store.toJSON());
};

var loadStore = exports.loadStore = function loadStore(serializedHeap, store) {
    var heap = JSON.parse(serializedHeap);
    store.heap = heap;
};