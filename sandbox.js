import EntityStore from './src/EntityStore';
import Model from './src/entity/Model';
import Directory from './src/directory/Directory';
import types from './src/types';

// const User = new Model('User', {
//     structure: {
//         name: types.Attribute,
//         rootReference: types.Reference('User'),
//         wrappedObject: {
//             wrappedReference: types.Reference('User'),
//             // wrappedValue: types.Attribute
//         }
//     }
// });
// const Store = new EntityStore([User]);


const Store = new EntityStore([]);

const directory = new Directory('TestDirectory', {
    structure: {
        page: types.Attribute,
        wrapped: {
            category: types.Attribute
        },
        computed: {
            
        }
    }
}, Store)

directory.clear();;


console.log(directory.observe().interface.page)