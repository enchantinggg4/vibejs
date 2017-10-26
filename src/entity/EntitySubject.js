import * as R from 'ramda';
import * as TypeChecker from '../functions/typeChecker';
import Mutation from './Mutation';
import isNumber from 'is-number'
export default class {
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
        const store = this.store;
        const entitySubject = this;
        Object.entries(structure).forEach(([key, value]) => {
            if (TypeChecker.isAttribute(structure[key])) {
                Object.defineProperty(item, key, {
                    get() {
                        return stateProvider.get(key);
                    },
                    set(value) {
                        stateProvider.set(key, value);
                    }
                })
            } else if (TypeChecker.isReference(structure[key])) {
                const relationName = structure[key].model;
                const relationID = stateProvider.get(key);
                let initialSubject = null;
                if (relationID) {
                    initialSubject = store.getOrCreateEntitySubject(relationName, relationID);
                    if (entitySubject.isSubscriberOf(relationName, relationID)) {

                    } else {
                        entitySubject.subscribe(relationName, relationID)(({ payload, source }) => {
                            store.entityUpdated(entitySubject.name, entitySubject.id, source);
                        });
                    }
                }
                Object.defineProperty(item, key, {
                    get() {
                        return R.path(['interface'], initialSubject);
                    },
                    set(value) {
                        if (initialSubject) {
                            entitySubject.unsubscribe(relationName, initialSubject.id);
                        }

                        const refID = entitySubject._processReference(value, stateProvider);
                        stateProvider.set(key, refID);
                        if (refID) {
                            initialSubject = store.getOrCreateEntitySubject(relationName, refID);
                            entitySubject.subscribe(relationName, refID)(({ payload, source }) => {
                                store.entityUpdated(entitySubject.name, entitySubject.id, source);
                            });
                        }
                    }
                })
            } else if (TypeChecker.isAttributeArray(structure[key])) {
                Object.defineProperty(item, key, {
                    get() {
                        return stateProvider.get(key);
                    },
                    set(value) {
                        stateProvider.set(key, value);
                    }
                })
            } else if (TypeChecker.isReferenceArray(structure[key])) {
                const relationName = structure[key].arrayOfType.model;
                const relationIDs = stateProvider.get(key);
                let subjects = [];
                subjects = relationIDs.map(relationID => {
                    const subject = store.getOrCreateEntitySubject(relationName, relationID);
                    if (entitySubject.isSubscriberOf(relationName, relationID)) {

                    } else {
                        entitySubject.subscribe(relationName, relationID)(({ payload, source }) => {
                            store.entityUpdated(entitySubject.name, entitySubject.id, source);
                        });
                    }
                    return subject;
                });
                Object.defineProperty(item, key, {
                    get() {
                        return subjects.map(it => it.interface);
                    },
                    set(relationIDs) {
                        subjects.forEach(subject => {
                            entitySubject.unsubscribe(relationName, subject.id);
                        });
                        subjects = relationIDs.map(value => {
                            const refID = entitySubject._processReference(value, stateProvider);
                            if (refID) {
                                const initialSubject = store.getOrCreateEntitySubject(relationName, refID);
                                entitySubject.subscribe(relationName, refID)(({ payload, source }) => {
                                    store.entityUpdated(entitySubject.name, entitySubject.id, source);
                                });
                                return initialSubject;
                            }
                        });
                        stateProvider.set(key, subjects.map(it => it.id));
                    }
                })
            } else if (TypeChecker.isIdentifier(structure[key])) {
                Object.defineProperty(item, key, {
                    get() {
                        return entitySubject.id;
                    },
                    set(value) {

                    }
                })
            } else {
                const get = (key2) => {
                    if (stateProvider.get(key))
                        return stateProvider.get(key)[key2];
                    else
                        throw new Error(`Trying to read not existing entity`)
                }
                const set = (key2, value) => {
                    stateProvider.set(key, {
                        [key2]: value
                    })
                }
                const wrappedItem = {};
                this._mapObserverToSource(wrappedItem, structure[key], {
                    get,
                    set
                })
                item[key] = wrappedItem;

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