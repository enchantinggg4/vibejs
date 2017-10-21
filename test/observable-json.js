import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'
import Struct from '../src/Struct'

describe('Observable json', function () {
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
        id: 1,
        name: "Vasya",
        wrapped: {
            number: 3
        },
        friend: 2
    });


    User.insertEntity({
        id: 2,
        name: "Petya",
        wrapped: {
            number: 1
        },
        friend: 1
    });

    it('deepness level: 1', function () {
        const jsonDeep1 = vasya.$json(1);
        assert.equal(JSON.stringify(jsonDeep1), JSON.stringify({ 
            "name": "Vasya", 
            "wrapped": { 
                "number": 3
             }, 
             "friend": {
                  "name": "Petya",
                   "wrapped": {
                        "number": 1
                    },
                    "friend": null,
                    "id": 2
            },
            "id": 1
        }))
    });
    it('deepness level: 2', function () {
        const jsonDeep1 = vasya.$json(2);
        assert.equal(JSON.stringify(jsonDeep1), JSON.stringify({ 
            "name": "Vasya", 
            "wrapped": { 
                "number": 3
             }, 
             "friend": {
                  "name": "Petya",
                   "wrapped": {
                        "number": 1
                    },
                    "friend": { 
                        "name": "Vasya", 
                        "wrapped": { 
                            "number": 3
                         }, 
                         "friend": null,
                        "id": 1
                    },
                    "id": 2
            },
            "id": 1
        }))
    });
})