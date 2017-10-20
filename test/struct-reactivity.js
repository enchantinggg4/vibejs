import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'
import Struct from '../src/Struct'


describe('Struct reactivity', function () {
    const User = new Model('User', {
        id: true,
        structure: {
            name: types.String
        }
    });

    const databaseStruct = new Struct({
        name: types.String,
        user: types.Reference('User')
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

    it('should have no user and empty name ', function(){
        assert.equal(db.name, undefined);
        assert.equal(db.user, null);
    });

    // it('should update when relation changed', function(done){
    //     new Promise((resolve, reject) => {
    //         db.user = User.observe(1);
    //         db.$observable.subscribe(change => {
    //             console.log(db);
    //             assert.equal(db.user.name, "lol");
    //             resolve()
    //         });
    //         db.user.name = "lol"
    //     }).then(done)
    // });
})