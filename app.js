import Model, { types } from './src/Model'
import EntityStore from './src/EntityStore'
import Struct from './src/Struct'

const User = new Model('User', {
    structure: {
        name: types.String,
        friends: types.Array(types.Reference('User')),
    }
});

const Store = new EntityStore([User]);

const vasya = User.observe(1);
// const petya = User.observe(2);

User.insertEntity({
    id: 1,
    name: "Vasya"
});

// const vasya = User.observe(1);

const struct = new Struct({
    name: types.String,
    author: types.Reference('User'),
    users: types.Array(types.Reference('User'))
}, Store);



const db = struct.observe();

console.log(db.name)