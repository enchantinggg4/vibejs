import assert from 'assert';
import Model from '../src/entity/Model';
import Directory from '../src/directory/Directory';
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        friend: types.Reference('User'),
        wrappedObject: {
            wrappedValue: types.Attribute
        }
    }
});
const Store = new EntityStore([User]);

const directory = new Directory('TestDirectory', {
    structure: {
        page: types.Attribute,
        author: types.Reference('User'),
        wrapped: {
            category: types.Attribute
        }
    }
}, Store)

beforeEach(function() {
    directory.clear();
    Store.clear();
});

  
describe('Directory as object', function () {
    const newValue = 4;

    it('should return default null value for not inserted root key', function () {
        assert.deepEqual(directory.observe().asObject(0), {
            page: null,
            author: null,
            wrapped: {
                category: null
            }
        });
    })
    it('should return realtions', function () {
        User.insertEntity(1, {
            name: "Piter",
            friend: 1,
            wrappedObject: {
                wrappedValue: 5
            }
        });
        directory.observe().mutate({
            page: newValue,
            author: 1,
            
        });
        assert.deepEqual(directory.observe().asObject(1), {
            page: newValue,
            author: {
                id: 1,
                name: "Piter",
                friend: null,
                wrappedObject: {
                    wrappedValue: 5
                }
            },
            wrapped: {
                category: null
            }

        });
    });
});
