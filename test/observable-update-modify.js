import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'
import Struct from '../src/Struct'

describe('Observable merge', function () {
    const User = new Model('User', {
        structure: {
            name: types.String,
            wrapped: {
                number: types.Number
            },
            friend: types.Reference('User')
        }
    });

    const Store = new EntityStore([User]);

    const vasya = User.observe(1);

    User.insertEntity({
        id: 2,
        name: "Petya",
        wrapped: {
            number: 1
        }
    });

    User.insertEntity({
        id: 1,
        name: "Vasya",
        wrapped: {
            number: 3
        }
    });

    it('should have all changes', function(){
        vasya.$merge({
            name: "Cock sucker",
            wrapped: {
                number: 15
            },
            friend: 2
        });
        assert.equal(vasya.name, "Cock sucker")
        assert.equal(vasya.wrapped.number, 15)
        assert.equal(vasya.friend.name, "Petya")
    });
})