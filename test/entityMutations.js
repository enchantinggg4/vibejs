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
    mutations: {
        upperCaseName(){
            this.name = this.name.toUpperCase()
        },
        appendToName(suffix){
            this.name = this.name + suffix;
        }
    }
});
const Store = new EntityStore([User]);

beforeEach(function() {
    Store.clear();
});

describe('Entity attributes', function () {
    const newEntityName = "Piter";
    const wrappedValue = "aBC";

    it('mutation with no parameters should modify entity', function () {
        User.insertEntity(1, {
            name: newEntityName,
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        entity.interface.upperCaseName();
        assert.equal(entity.interface.name, newEntityName.toUpperCase());
    });
    it('mutation with parameters should modify entity parametrized', function () {
        User.insertEntity(1, {
            name: newEntityName,
            wrappedObject: {
                wrappedValue: wrappedValue
            }
        });
        const entity = User.observe(1);
        entity.interface.appendToName("somesuffix");
        assert.equal(entity.interface.name, newEntityName + "somesuffix");
    });
});
