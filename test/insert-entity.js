import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'
import Struct from '../src/Struct'


describe('Insert entity', function () {
    const Todo = new Model('Todo', {
        structure: {
            title: types.String,
            description: types.String,
            done: types.Boolean
        }
    });

    const Store = new EntityStore([Todo]);
    const vasya = Todo.observe(1);
    // const petya = Todo.observe(2);

    Todo.insertEntity({
        id: 1,
        title: "Feed dog",
        description: "At 6 p.m",
        // done: false,
      });

    it('should have no users and empty name ', function(){
        assert.equal(vasya.title, 'Feed dog')
        assert.equal(vasya.description, 'At 6 p.m')
        assert.equal(vasya.done, false)

    });
    
})