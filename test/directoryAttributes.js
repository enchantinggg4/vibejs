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
    }
}, Store)

beforeEach(function() {
    directory.clear();
});

  
describe('Directory  attributes', function () {
    const newValue = 4;

    it('should return default null value for not inserted root key', function () {
        assert.equal(directory.observe().interface.page, null);
    })
    it('should return new value  for root key', function () {
        directory.observe().mutate({
            page: newValue
        });
        assert.equal(directory.observe().interface.page, newValue);
    })
    
    it('should return default null for not inserted wrapped key', function () {
        assert.equal(directory.observe().interface.wrapped.category, null);
    });
    it('should return new value for not inserted wrapped key', function () {
        directory.observe().mutate({
            wrapped: {
                category: newValue
            }
        });
        assert.equal(directory.observe().interface.wrapped.category, newValue);
    });
});
