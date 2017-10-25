"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = setComputedProperty;
function setComputedProperty(item, key, computer) {
    Object.defineProperty(item, key, {
        get: function get() {
            try {
                return computer.bind(item)();
            } catch (e) {
                return null;
            }
        },
        set: function set(val) {
            // ignore, immutable
        }
    });
}