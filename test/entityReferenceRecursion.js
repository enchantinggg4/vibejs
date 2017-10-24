import assert from 'assert';
import Model from '../src/entity/Model'
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        rootReference: types.Reference('User'),
    }
});
const Store = new EntityStore([User]);

beforeEach(function() {
    Store.clear();
});

  
describe('Entity recursion reactivity', function () {
    const newEntityName = "Piter";
    const relatedEntityName = "Ivan";
    

    it('should not have recursion updates', function () {
        User.insertEntity(1, {
            id: 1,
            name: newEntityName,
            rootReference: 2,
        });

        User.insertEntity(2, {
            id: 2,
            name:relatedEntityName,
            rootReference: 1
        });

        const entity = User.observe(1);
        const relatedEntity = User.observe(2);
        

        assert.equal(entity.interface.rootReference.name, relatedEntityName);
        let hasError = false
        try{
            entity.interface.name = "new name";
        }catch(e){
            hasError = true;
        }
        assert.equal(hasError, false);
        assert.equal(relatedEntity.interface.rootReference.name, "new name");


    });

});
