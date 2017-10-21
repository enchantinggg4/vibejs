import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'

describe('Delete entity', function() {
    const User = new Model('User', {
        structure: {
            name: types.String,
            friend: types.Reference('User')
        }
    });

    const Store = new EntityStore([User]);

    const vasya = User.observe(1);


    User.insertEntity({
        id: 1,
        name: "Vasya",
        friend: 2
    });

    it('should delete from heap, observables and remove all subscribers', function () {
        vasya.$delete();
        console.log(vasya);
    })
});