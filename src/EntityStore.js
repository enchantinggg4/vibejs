import * as R from 'ramda';

import Rx from 'rxjs/Rx';
import EntitySubject from './entity/EntitySubject';


/**
 * @class {EntityStore}
 */
export default class EntityStore {

    /**
     * Constructs entity store
     * @param {Array} models - array of defined models
     */
    constructor(models) {
        /**
         * Saved array of models for resetting purposes
         * @member {Array}
         **/
        this._modelsArray = models;
        /**
         * Object with models where key is model name and value is model instance
         * @member {Object}
         **/
        this.models = {};
        /**
         * Object with entities where key is [model name][entity id] and value is entity state
         * @member {Object}
         **/
        this.heap = {};
        /**
         * Object with subjects where key is [model name][entity id] and value is entity state
         * @member {Object}
         **/
        this.observables = {};
        this._setupModelsAndHeap(models);
    }

    /**
     * Resolve all entities of model
     * @param {string} model - name of model
     * @returns {Array} - all kept entities as subject array
     */
    allEntities(model) {
        return Object.keys(this.heap[model]).map(key => {
            return this.getOrCreateEntitySubject(model, key);
        })
    }

    /**
     * Notifies all subscribers entity is updated
     * @param {string} model - name of model
     * @param {*} id - id of entity
     * @param {Object} value - result state
     * @param {EntitySubject} source - EntitySubject which caused update
     * @param {string} message - optional message for debugging purposes
     */
    updateEntity(model, id, value, source, message = '') {
        this.heap[model][id] = value;
        this.entityUpdated(model, id, source);
    }

    /**
     * Clears internal objects
     * @param {*} models - array of defined models
     */
    _setupModelsAndHeap(models) {
        models.forEach(model => {
            this.models[model.name] = model;
            this.heap[model.name] = {};
            this.observables[model.name] = {};
            model.attachStore(this);
        });
    }

    /**
     * Clears heap and observables
     */
    clear() {
        this._setupModelsAndHeap(this._modelsArray);
    }

    /**
     * Put or replace state of entity
     * @param {string} model - name of model
     * @param {*} id - entity id 
     * @param {Object} value - result state
     */
    putEntity(model, id, value) {
        this.heap[model][id] = value;
        this.getOrCreateEntitySubject(model, id).updateInterface();
    }

    /**
     * Delete entity from heap
     * @param {string} model - name of model
     * @param {*} id - entity id
     */
    deleteEntity(model, id) {
        delete this.heap[model][id];
        this.getOrCreateEntitySubject(model, id).updateInterface();
    }

    /**
     * Lazy EntitySubject evaluation
     * @see {@link EntitySubject}
     * @param {string} name - name of model
     * @param {*} id - entity id
     */
    getOrCreateEntitySubject(name, id) {
        const observable = this.observables[name][id];
        if (observable)
            return observable;
        else
            return this._createEntitySubject(name, id);
    }

    /**
     * Create and return subject
     * @see {@link EntityStore.getOrCreateEntitySubject}
     * @param {string} model - name of model
     * @param {*} id - entity id
     */
    _createEntitySubject(model, id) {
        this.observables[model][id] = new EntitySubject(model, id, new Rx.Subject(), this.models[model], this);
        return this.observables[model][id];
    }


    /**
     * Called when need to force update entity
     * @param {string} model - name of model
     * @param {*} id - entity id
     * @param {EntitySubject} source - cause of update
     */
    entityUpdated(model, id, source) {
        this.getOrCreateEntitySubject(model, id).observable.next({
            payload: this.heap[model][id],
            source
        });
    }
}