import assert from 'assert';
import Model, { types } from '../src/Model'
import EntityStore from '../src/EntityStore'
import Struct from '../src/Struct'
import {serializeStore, loadStore} from '../src/VibePersist';

describe('Persist', function () {
    const User = new Model('User', {
        structure: {
            name: types.String
        }
    });

    const Store = new EntityStore([User]);

    User.insertEntity({
        id: 1,
        name: "Vasya"
    });

    const serializedHeap = serializeStore(Store);
    
    it('should have same entities after load', function(){
        const localStore = new EntityStore([User]);
        loadStore(serializedHeap, localStore);
        assert.equal(User.observe(1).name, "Vasya");
        assert.equal(User.observe(2).name, "");
    });
})