import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'


describe('Model with relation', function () {
    const User = new Model('User', {
        id: true,
        structure: {
            name: types.String,
            friend: types.Reference('User')
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

    it('should have null friend', function(){
        assert.equal(vasya.friend, null);
    });
    it('should have not-null friend', function(){
        vasya.friend = petya;
        assert.notEqual(vasya.friend, null);
    });
    it('should have null friend for sure', function(){
        vasya.friend = null;
        assert.equal(vasya.friend, null);
    });
})