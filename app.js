import Model, { types } from './src/Model'
import EntityStore from './src/EntityStore'
import Struct from './src/Struct'
import createObservable from './src/functions/createObservable';

const User = new Model('User', {
    id: true,
    structure: {
        attributes: {
            name: types.String
        },
        relationships: {
            friend: types.Reference('User')
        }
    },
});
const Store = new EntityStore([User]);

const databaseStruct = new Struct({
    structure: {
        attributes: {
            name: types.String,
        },
        users: types.Array(types.Reference('User'))
    }
}, Store);

const db = databaseStruct.observe();

const vasya = User.observe(1);
const petya = User.observe(2);

db.$observable.subscribe(_ => {
    console.log(db.$json())
});


