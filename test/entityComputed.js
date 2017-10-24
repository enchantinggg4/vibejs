import assert from 'assert';
import Model from '../src/entity/Model'
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const User = new Model('User', {
    structure: {
        name: types.Attribute,
        rootReference: types.Reference('User'),
        wrappedObject: {
            wrappedValue: types.Attribute,
            wrappedReference: types.Reference('User')
        }
    },
    computed: {
        upperCaseName(){
            return (this.name || "").toString().toUpperCase()
        },
        lowerCaseWrappedValue(){
            return (this.wrappedObject.wrappedValue || "").toString().toLowerCase()
        },
        rootReferenceName(){
            return this.rootReference && this.rootReference.name || null
        },
        wrappedReferenceName(){
            return this.wrappedObject.wrappedReference && this.wrappedObject.wrappedReference.name || null
        }
    }
});
const Store = new EntityStore([User]);

beforeEach(function() {
    Store.clear();
});

  
describe('Entity computed values', function () {
    const newEntityName = "Piter";
    const wrappedValue = "aBC";

    it('should return computed value for root attribute', function () {
        User.insertEntity(1, {
            name: newEntityName,
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.upperCaseName, newEntityName.toUpperCase());
    });
    it('should return computed value for wrapped attribute', function () {
        User.insertEntity(1, {
            name: newEntityName,
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.lowerCaseWrappedValue, wrappedValue.toLowerCase());
    });
    it('should return computed value for root reference', function () {
        User.insertEntity(1, {
            name: newEntityName,
            rootReference: 1
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.rootReferenceName, newEntityName);
    });
    it('should return computed value for wrapped reference', function () {
        User.insertEntity(1, {
            name: newEntityName,
            wrappedObject: {
                wrappedReference: 1
            }
        });
        const entity = User.observe(1);
        assert.equal(entity.interface.wrappedReferenceName, newEntityName);
    })
});
