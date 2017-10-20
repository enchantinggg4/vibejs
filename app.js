import Model, { types } from './src/Model'
import EntityStore from './src/EntityStore'
import Struct from './src/Struct'
import createObservable from './src/functions/createObservable';

const User = new Model('User', {
    id: true,
    structure: {
        name: types.String,
        friend: types.Reference('User')
    },
    computed: {
        upperCaseName() {
            return this.name.toUpperCase();
        }
    }
});
const Store = new EntityStore([User]);

const vasya = User.observe(1);
// const petya = User.observe(2);

User.insertEntity({
    id: 1,
    name: "Vasya"
});

const dbstruct = new Struct({
    structure: {
        name: types.String,
        friends: types.Array(types.Reference('User'))
    }
}, Store)

const db = dbstruct.observe();



db.$observable.subscribe(_ => {
    console.log("Hello", db.friends[0].$json())
})

db.friends = [vasya];