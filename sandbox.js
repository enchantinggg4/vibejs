import EntityStore from './src/EntityStore';
import Model from './src/entity/Model';
import Directory from './src/directory/Directory';
import types from './src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        rootReference: types.Reference('User'),
    }
});
const Store = new EntityStore([User]);


// const Store = new EntityStore([]);

// const directory = new Directory('TestDirectory', {
//     structure: {
//         page: types.Attribute,
//         wrapped: {
//             category: types.Attribute
//         },
//         computed: {
            
//         }
//     }
// }, Store)

// directory.clear();;
const newEntityName = "Piter";
const relatedEntityName = "Ivan";

User.insertEntity(1, {
    name: newEntityName,
    rootReference: 2,
});

User.insertEntity(2, {
    name: relatedEntityName,
    rootReference: 1
});


const entity = User.observe(1);
const relatedEntity = User.observe(2);

entity.interface.name = "!@";
// console.log(Store.heap);
// console.log(User.observe(2).interface.rootReference.name);