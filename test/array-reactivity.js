import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'


describe('Model with array relationship', function () {
    const User = new Model('User', {
        structure: {
            name: types.String,
            friends: types.Array(types.Reference('User')),
        }
    });

    const Store = new EntityStore([User]);
    const vasya = User.observe(1);
    const petya = User.observe(2);

    User.insertEntity({
        id: 1,
        name: "Vasya"
    });
    User.insertEntity({
        id: 2,
        name: "Petya"
    });

    it('should have no friends', function(){
        vasya.friends = [];
        assert.equal(vasya.friends.length, 0);
    });

    it('should have 1 friend', function(){
        vasya.friends = [petya];
        console.log(Store.heap);
        console.log("HELP ME PLEASE", petya);
        assert.equal(vasya.friends[0].name, petya.name);
    });

    it('should change after friend change', function(){
        vasya.friends = [petya];
        petya.name = "petya2"
        assert.deepEqual(vasya.friends[0].name, "petya2");
    });
})