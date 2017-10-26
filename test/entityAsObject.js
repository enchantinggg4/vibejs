import assert from 'assert';
import Model from '../src/entity/Model'
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        friend: types.Reference('User'),
        friends: types.Array(types.Reference('User')),
        wrappedObject: {
            wrappedValue: types.Attribute
        }
    }
});
const Store = new EntityStore([User]);

beforeEach(function() {
    Store.clear();
});

  
describe('Entity to object conversion', function () {
    const newEntityName = "Piter";
    const wrappedValue = 4;

    it('should return valid json for all fields', function () {
        User.insertEntity(1, {
            name: newEntityName,
            friend: 1,
            friends: [1],
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        assert.deepEqual(entity.asObject(1), {
            name: newEntityName,
            friend: {
                id: 1,
                name: newEntityName,
                wrappedObject: {
                    wrappedValue: wrappedValue
                },
                friend: null,
                friends: []
            },
            friends: [{
                id: 1,
                name: newEntityName,
                wrappedObject: {
                    wrappedValue: wrappedValue
                },
                friend: null,
                friends: []
            }],
            wrappedObject: {
                wrappedValue: wrappedValue
            },
            id: 1,
        });
    });

    it('should return valid json for undefined relation fields', function () {
        User.insertEntity(1, {
            name: newEntityName,
            friend: null,
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        assert.deepEqual(entity.asObject(1), {
            name: newEntityName,
            friend: null,
            friends: [],
            wrappedObject: {
                wrappedValue: wrappedValue
            },
            id: 1,
        });
    });

    it('should return null if relation not in deepness range', function () {
        User.insertEntity(1, {
            name: newEntityName,
            friend: 1,
            friends: [1],
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        assert.deepEqual(entity.asObject(0), {
            name: newEntityName,
            friend: null,
            friends: [],
            wrappedObject: {
                wrappedValue: wrappedValue
            },
            id: 1,
        });
    });
});
