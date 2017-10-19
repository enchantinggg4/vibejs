import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'

describe('Entity not in pull yet', function() {
    const User = new Model('User', {
        id: true,
        structure: {
            name: types.String
        }
    });
    
    const Store = new EntityStore([User]);
    
    const observableID = 1;
    const entity = User.observe(observableID);
    it('should return default for attribute key', function () {
        assert.equal(entity.name, User.structure.name.default());
    })
    it('should return id of entity it observes', function(){
        assert.equal(entity.id, observableID);
    })
});

describe('Entity not in pull yet then modified', function() {
    const User = new Model('User', {
        id: true,
        structure: {
            name: types.String
        }
    });
    
    const Store = new EntityStore([User]);
    
    const observableID = 1;
    const entity = User.observe(observableID);

    const newEntityName = "new name";
    entity.name = "new name";
    it('should return new value for attribute key', function () {
        assert.equal(entity.name, newEntityName);
    })
    it('should return id of entity it observes', function(){
        assert.equal(entity.id, observableID);
    })
});
