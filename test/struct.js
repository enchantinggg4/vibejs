import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'
import Struct from '../src/Struct'


describe('Struct', function () {
    const User = new Model('User', {
        id: true,
        structure: {
            name: types.String
        }
    });

    const databaseStruct = new Struct({
        name: types.String,
        users: types.Array(types.Reference('User'))
    });

    const db = databaseStruct.observe();

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

    it('should have no users and empty name ', function(){
        assert.equal(db.name, "");
        assert.equal(db.users.length, 0);
    });
    it('should have new name', function(){
        db.name = "new db";
        assert.equal(db.name, "new db");
    });
    it('should have users', function(){
        db.users = [vasya, petya];
        assert.deepEqual(db.users, [vasya, petya]);
    });
})