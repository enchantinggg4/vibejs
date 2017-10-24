import assert from 'assert';
import Model from '../src/entity/Model'
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        wrappedObject: {
            wrappedValue: types.Attribute
        }
    }
});
const Store = new EntityStore([User]);

beforeEach(function() {
    Store.clear();
});

  
describe('Entity attributes', function () {
    const newEntityName = "Piter";
    const wrappedValue = 4;

    it('should return new value for root key', function () {
        User.insertEntity(1, {
            name: newEntityName,
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.name, newEntityName);
    })
    it('should return new value for wrapped object key', function () {
        User.insertEntity(1, {
            name: newEntityName,
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        
        const entity = User.observe(1);
        assert.equal(entity.interface.wrappedObject.wrappedValue, wrappedValue);
    })
    it('should return null for not inserted root key', function () {
        User.insertEntity(1, {
            // name: null,
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.name, null);
    });
    it('should return null for not inserted wrapped key', function () {
        User.insertEntity(1, {
            
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.wrappedObject.name, null);
    });
});
