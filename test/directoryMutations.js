import assert from 'assert';
import Model from '../src/entity/Model';
import Directory from '../src/directory/Directory';
import EntityStore from '../src/EntityStore'
import types from '../src/types';

const Store = new EntityStore([]);

const directory = new Directory('TestDirectory', {
    structure: {
        page: types.Attribute,
        wrapped: {
            category: types.Attribute
        }
    },
    mutations: {
        incrementPage(){
            this.page++;
        },
        setCategory(category){
            this.wrapped.category = category;
        }
    }
}, Store)

beforeEach(function() {
    directory.clear();
});

  
describe('Directory mutations', function () {
    const newValue = 4;

    it('should return new mutated value', function () {
        directory.observe().interface.page = 0;
        directory.observe().interface.incrementPage();
        assert.equal(directory.observe().interface.page, 1);
    })
    it('should return new mutated value with paramter', function () {
        directory.observe().interface.setCategory("VIDEO");        
        assert.equal(directory.observe().interface.wrapped.category, "VIDEO");
    })
});
