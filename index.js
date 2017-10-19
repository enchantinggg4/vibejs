require('babel-register')
module.exports = {
    EntityStore: require('./src/EntityStore'),
    Model: require('./src/Model').default,
    types: require('./src/Model').types,
    Struct: require('./src/Struct'),
}