import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'

describe('Entity id immutability', function() {
    const User = new Model('User', {
        id: true,
        structure: {
            name: types.String
        }
    });
    
    const Store = new EntityStore([User]);
    
    const observableID = 1;
    const entity = User.observe(observableID);
    entity.id = 234;
    entity.name = "test";
    it('should return same id', function(){
        assert.equal(entity.id, observableID);
    });
    it('should return new name', function(){
        assert.equal(entity.name, "test");
    })
});
