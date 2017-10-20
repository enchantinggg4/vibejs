'use strict';

require('babel-register');
module.exports = {
    EntityStore: require('./EntityStore').default,
    Model: require('./Model').default,
    types: require('./Model').types,
    Struct: require('./Struct').default
};