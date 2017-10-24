import assert from 'assert';
import Model from '../src/entity/Model'
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        rootReference: types.Reference('User'),
        friends: types.Array(types.Reference('User'))
    }
});
const Store = new EntityStore([User]);

beforeEach(function() {
    Store.clear();
});

  
describe('Entity reference set by subject', function () {
    const newEntityName = "Piter";
    const relatedEntityName = "Ivan";
    

    it('should validate subject as single reference value', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            rootReference: null,
        });

        User.insertEntity(2, {
            id: 2,
            name:relatedEntityName,
            rootReference: null
        });

        const entity = User.observe(1);
        const relatedEntity = User.observe(2);

        entity.interface.rootReference = relatedEntity.interface
        assert.equal(entity.interface.rootReference.name, relatedEntityName)
    });

    it('should validate subjects as reference array value', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            rootReference: null,
            
        });

        User.insertEntity(2, {
            id: 2,
            name:relatedEntityName,
            rootReference: null
        });

        const entity = User.observe(1);
        const relatedEntity = User.observe(2);

        entity.interface.friends = [relatedEntity.interface];
        assert.equal(entity.interface.friends[0].name, relatedEntityName)
    });

    it('should validate mixed subjects and ids as reference array value', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            rootReference: null,
            
        });

        User.insertEntity(2, {
            id: 2,
            name:relatedEntityName,
            rootReference: null
        });

        const entity = User.observe(1);
        const relatedEntity = User.observe(2);

        entity.interface.friends = [relatedEntity.interface, 1];
        assert.equal(entity.interface.friends[0].name, relatedEntityName)
        assert.equal(entity.interface.friends[1].name, newEntityName)
    });
});
