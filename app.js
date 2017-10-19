import Model, { types } from './src/Model'
import EntityStore from './src/EntityStore'
import Struct from './src/Struct'

const User = new Model('User', {
    id: true,
    structure: {
        name: types.String,
    },
    computed: {
        upperCaseName(){
            return this.name.toUpperCase();
        }
    }
});
const Store = new EntityStore([User]);


const databaseStruct = new Struct({
    structure: {
        name: types.String,
        author: types.Reference('User'),
        users: types.Array(types.Reference('User'))
    },
    computed: {
        usersCount(){
            return this.users.length;
        },
        authorName(){
            return this.author.upperCaseName;
        }
    }
}, Store);

const db = databaseStruct.observe();
const vasya = User.observe(1);
const petya = User.observe(2);

User.insertEntity({
    id: 1,
    name: "Vasya"
});
User.insertEntity({
    id: 2,
    name: "Petya"
});

db.$subscribe(_ => {
    // console.log("Update hah", _.$json())
    console.log(db.authorName)
});

db.name = "sfad";
db.author = 1;