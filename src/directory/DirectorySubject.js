import * as R from 'ramda';

import * as TypeChecker from '../functions/typeChecker';
import DirectoryMutation from './DirectoryMutation';
import Rx from 'rxjs/Rx';
import extendArray from '../functions/extendArray';
import createReactiveInterface from '../functions/createReactiveInterface';

/**
 * @class {DirectorySubject}
 */
export default class DirectorySubject {
    /**
     * Create DirectorySubject
     * @param {Directory} directory 
     * @param {EntityStore} store 
     */
    constructor(directory, store) {
        /**
         * Attached {@link Directory}
         * @member {Directory}
         */
        this.directory = directory;
        /**
         * Attached {@link EntityStore}
         * @member {EntityStore}
         */
        this._store = store;
        /**
         * [model name][entity id] like structure of subscriptions
         * @member {Object}
         */
        this._subscriptions = {};
        /**
         * Observable, updated each time directory state is changed
         * @member {Rx.Subject}
         */
        this.observable = new Rx.Subject();

        Object.entries(store.models).forEach(([key, value]) => {
            this._subscriptions[key] = {};
        });

        this.observable.subscribe(_ => {
            this.updateInterface();
        })

        /**
         * Reactive interface which contains mutations, computed values and evaluated state
         * @member {Object}
         */
        this.interface = null;
        this.updateInterface();
    }

    /**
     * Force update interface
     */
    updateInterface() {
        this.interface = this._createReactiveInterface();
    }

    /**
     * Mutate directory state
     * @param {Object} mutation - payload
     * @param {string} message - commit message
     */
    mutate(mutation, message = "") {
        new DirectoryMutation(this, mutation).commit(message)
    }

    /**
     * Writes evaluated state into item from structure
     * @param {Object} structure - structure
     * @param {Object} item - object to write to
     * @param {number} deepness - how deep to resolve relationships
     */
    _asObject(structure, item, deepness) {
        const json = {};
        Object.entries(structure).forEach(([key, value]) => {
            if (TypeChecker.isAttribute(structure[key])) {
                json[key] = item[key];
            } else if (TypeChecker.isAttributeArray(structure[key])) {
                json[key] = item[key];
            } else if (TypeChecker.isReference(structure[key])) {
                if (deepness > 0 && item[key])
                    json[key] = item[key].$subject.asObject(deepness - 1);
                else
                    json[key] = null;
            } else if (TypeChecker.isReferenceArray(structure[key])) {
                if (deepness > 0)
                    json[key] = item[key].map(inter => {
                        return inter.$subject.asObject(deepness - 1);
                    })
                else
                    json[key] = [];
            } else if (TypeChecker.isIdentifier(structure[key])) {
                json[key] = item[key];
            } else {
                //object
                json[key] = this._asObject(structure[key], item[key], deepness);
            }
        })

        return json;
    }

    /**
     * @returns {Object} - evaluated javascript object
     * @param {number} relationDeepness - how deep to resolve relationships
     */
    asObject(relationDeepness) {
        if (this.interface) {
            const result = this._asObject(this.directory.structure, this.interface, relationDeepness)
            this._applyComputed(result);
            return result;
        } else
            return null;
    }

    /**
     * Force update observable
     */
    update() {
        this.observable.next(this.state);
    }


    /**
     * @returns {Object} - reactive interface
     */
    _createReactiveInterface() {
        const get = (key) => {
            return this.directory.state[key];
        }
        const set = (key, value) => {
            this.mutate({
                [key]: value
            }, `Modify ${key} with value ${value}`)
        }
        const reactiveInterface = {};
        this._mapObserverToSource(reactiveInterface, this.directory.structure, {
            get,
            set
        });
        this._applyComputed(reactiveInterface);
        this._applyMutations(reactiveInterface);
        return reactiveInterface;
    }


    /**
     * Insert computed values into item(reactive interface or evaluated state)
     * @param {Object} item 
     */
    _applyComputed(item) {
        Object.entries(this.directory.computed).forEach(([key, value]) => {
            item[key] = value.call(item)
        });
    }

    /**
     * Insert mutation functions into reactiveInteface
     * @param {Object} reactiveInterface 
     */
    _applyMutations(reactiveInterface) {
        Object.entries(this.directory.mutations).forEach(([key, value]) => {
            reactiveInterface[key] = value.bind(reactiveInterface)
        })
    }


    /**
     * Define reactive getters and setters
     * @param {Object} item - object to write to
     * @param {Object} structure - structure
     * @param {Object} stateProvider - get by key and set by key and value helper
     */
    _mapObserverToSource(item = {}, structure, stateProvider) {
        const store = this._store;
        const directorySubject = this;
        createReactiveInterface({
            item: item,
            stateProvider: stateProvider,
            store: this._store,
            updateState(source) {
                directorySubject.update();
            },
            structure: this.directory.structure,
            subscribe(name, id) {
                if (!directorySubject.isSubscriberOf(name, id)) {
                    directorySubject.subscribe(name, id)(({ payload, source }) => {
                        directorySubject.update();
                    });
                }
            },
            unsubscribe(name, id) {
                directorySubject.unsubscribe(name, id)
            }
        });
    }

    /**
     * @returns {Boolean} - is this subject is subscriber of passed entity
     * @param {string} name - model name
     * @param {*} id - entity id
     */
    isSubscriberOf(name, id) {
        return this._subscriptions[name][id];
    }

    /**
     * Prepares to subscribe
     * Will rewrite previous subscription
     * @returns {Function} - real subscribe function
     * @param {stirng} name - model name
     * @param {*} id - entity id
     */
    subscribe(name, id) {
        return (a, b, c) => {
            this._subscriptions[name][id] = this._store.getOrCreateEntitySubject(name, id).observable
                .filter(({ payload, source }) => source !== this)
                .subscribe(a, b, c);
        }
    }

    /**
     * Unsubscribe from entity updates and delete subscription
     * @param {string} name - model name
     * @param {*} id - entity id 
     */
    unsubscribe(name, id) {
        if (this._subscriptions[name][id]) {
            this._subscriptions[name][id].unsubscribe();
        }
        delete this._subscriptions[name][id];
    }
}