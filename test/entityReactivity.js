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

  
describe('Entity reactivity', function () {
    const newEntityName = "Piter";
    const wrappedValue = 4;

    it('should update once for attribute change', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            rootReference: 1,
            wrappedObject: {
                wrappedReference: 1
            }
        });
        const entity = User.observe(1);
        let updates = 0;
        entity.observable.subscribe(_ => {
            updates += 1;
        });
        assert.equal(updates, 0);
        entity.interface.name = "New name";
        assert.equal(updates, 1);
        entity.interface.rootReference.name = "!@#";
        assert.equal(updates, 2);
        entity.interface.wrappedObject.wrappedReference.name = "!@#";
        assert.equal(updates, 3);
    });

    it('should not update when removed reference', function () {
        User.insertEntity(2, {
            id: 2,
            name: "Somebody i used to know",
        });
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            rootReference: 2,
        });
        const entity = User.observe(1);
        const relatedEntity = User.observe(2);
        let updates = 0;
        entity.observable.subscribe(_ => {
            updates += 1;
        });
        assert.equal(updates, 0);
        entity.interface.rootReference = null;
        assert.equal(updates, 1);
        relatedEntity.interface.name = "Now u dont know me.."
        assert.equal(updates, 1);

    });

});
