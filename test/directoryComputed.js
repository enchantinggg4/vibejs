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
    computed: {
        nextPage(){
            return (this.page && this.page + 1) || 0;
        },
        upperCasedCategory(){
            return this.wrapped.category && this.wrapped.category.toString().toUpperCase() || ""
        }
    }
}, Store)

beforeEach(function() {
    directory.clear();
});

  
describe('Directory computed values', function () {
    const newValue = 4;

    it('should return computed value for root attribute', function () {
        assert.equal(directory.observe().interface.nextPage, 0);
    })
    it('should return computed value for wrapped attribute', function () {
        directory.observe().interface.wrapped.category = "video";
        assert.equal(directory.observe().interface.upperCasedCategory, "VIDEO");
    })
});
