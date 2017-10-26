import * as R from 'ramda';
import * as TypeChecker from '../functions/typeChecker';
import Mutation from './Mutation';
import isNumber from 'is-number'
import createReactiveInterface from '../functions/createReactiveInterface';

/**
 * @class {EntitySubject}
 */
export default class EntitySubject{
    constructor(name, id, observable, model, store) {
        this.name = name;
        this.id = id;
        this.model = model;
        this.observable = observable;
        this.store = store;
        this.subscriptions = {};
        Object.entries(store.models).forEach(([key, value]) => {
            this.subscriptions[key] = {};
        });

        this.interface = this.createReactiveInterface();

        this.subscriptions[name][id] = this.observable.filter(({ payload, source }) => source !== this);
        this.subscriptions[name][id].subscribe(({ payload, source }) => {
            this.updateInterface();
        }, error => {

        }, complete => {

        });
    }

    updateInterface() {
        this.interface = this.createReactiveInterface();
    }

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

    asObject(relationDeepness) {
        if (this.interface){
            const result = this._asObject(this.model.structure, this.interface, relationDeepness)
            this._applyComputed(result);
            return result;
        }else
            return null;
    }

    mutate(mutation, message = "") {
        if (this.store.heap[this.name][this.id]) {
            new Mutation(this, mutation).commit(message)
        } else {
            throw new Error(`Trying to modify not existing entity`);
        }
    }


    createReactiveInterface() {
        if (this.store.heap[this.name][this.id]) {
            const get = (key) => {
                if (this.store.heap[this.name][this.id])
                    return this.store.heap[this.name][this.id][key];
                else
                    throw new Error(`Trying to read not existing entity`)
            }
            const set = (key, value) => {
                this.mutate({
                    [key]: value
                }, `Modify ${key} with value ${value}`)
            }
            const reactiveInterface = {};
            this._mapObserverToSource(reactiveInterface, this.model.structure, {
                get,
                set
            });
            this._applyComputed(reactiveInterface);
            this._applyMutations(reactiveInterface);

            reactiveInterface.$subject = this;
            return reactiveInterface;
        } else {
            return null;
        }
    }


    _applyComputed(reactiveInterface) {
        Object.entries(this.model.computed).forEach(([key, value]) => {
            reactiveInterface[key] = value.call(reactiveInterface)
        });
    }

    _applyMutations(reactiveInterface) {
        Object.entries(this.model.mutations).forEach(([key, value]) => {
            reactiveInterface[key] = value.bind(reactiveInterface)
        })
    }

    _processReference(value, stateProvider) {
        if (isNumber(value)) {
            return value;
        } else if (value == null) {
            return value;
        } else if ('id' in value && isNumber(value.id)) {
            return value.id
        } else {
            throw new Error("Invalid reference: expected id, null or subject")
        }
    }

    _mapObserverToSource(item = {}, structure, stateProvider) {
        const entitySubject = this;
        return createReactiveInterface({
            item: item,
            stateProvider: stateProvider,
            store: this.store,
            updateState(source){
                this.store.entityUpdated(entitySubject.name, entitySubject.id, source);
            },
            structure: this.model.structure,
            subscribe(name, id){
                if (!entitySubject.isSubscriberOf(name, id)) {
                    entitySubject.subscribe(name, id)(({ payload, source }) => {
                        entitySubject.store.entityUpdated(entitySubject.name, entitySubject.id, source);                        
                    });
                }
            },
            unsubscribe(name, id){
                entitySubject.unsubscribe(name, id)
            }
        })
    }

    equals(entitySubject) {
        return this === entitySubject;
    }


    isSubscriberOf(name, id) {
        return this.subscriptions[name][id];
    }

    subscribe(name, id) {
        return (a, b, c) => {
            this.subscriptions[name][id] = this.store.getOrCreateEntitySubject(name, id).observable
                .filter(({ payload, source }) => source !== this)
                .subscribe(a, b, c);
        }
    }

    unsubscribe(name, id) {
        if (this.subscriptions[name][id]) {
            this.subscriptions[name][id].unsubscribe();
        }
        delete this.subscriptions[name][id];
    }


    toString() {
        return `"${this.name}.${this.id}"`
    }
}