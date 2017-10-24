import assert from 'assert';
import Model from '../src/entity/Model'
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        rootReference: types.Reference('User'),
        wrappedObject: {
            wrappedReference: types.Reference('User'),
        }
    }
});
const Store = new EntityStore([User]);

beforeEach(function() {
    Store.clear();
});

  
describe('Entity references', function () {
    const newEntityName = "Piter";
    const wrappedValue = 4;

    it('should return null for not defined root reference', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.rootReference, null);
    });
    it('should return null for not defined wrapped reference', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.wrappedObject.wrappedReference, null);
    });
    it('should return subject for defined reference', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            rootReference: 1
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.rootReference.name, newEntityName);
    });
    it('should return subject for defined wrapped reference', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            wrappedObject: {
                wrappedReference: 1
            }
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.wrappedObject.wrappedReference.name, newEntityName);
    })
});
