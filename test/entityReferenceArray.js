import assert from 'assert';
import Model from '../src/entity/Model'
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        friends: types.Array(types.Reference('User'))
    }
});
const Store = new EntityStore([User]);

beforeEach(function() {
    Store.clear();
});

  
describe('Entity reference array reactivity', function () {
    const newEntityName = "Piter";
    const wrappedValue = 4;

    it('should not update when changed reference array ', function () {
        User.insertEntity(2, {
            id: 2,
            name: "Somebody i used to know",
        });
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            friends: [2],
        });
        const entity = User.observe(1);
        const relatedEntity = User.observe(2);

        let updates = 0;
        entity.observable.subscribe(_ => {
            updates += 1;
        });
        assert.equal(updates, 0);
        entity.interface.friends = [];
        assert.equal(updates, 1);
        relatedEntity.interface.name = "Now u dont know me.."
        assert.equal(updates, 1);

    });

});
