import * as R from 'ramda';

import * as TypeChecker from '../functions/typeChecker';
import DirectoryMutation from './DirectoryMutation';
import Rx from 'rxjs/Rx';
import extendArray from '../functions/extendArray';

export default class {
    constructor(directory, store) {
        this.directory = directory;
        this.store = store;
        this.subscriptions = {};
        this.observable = new Rx.Subject();
        Object.entries(store.models).forEach(([key, value]) => {
            this.subscriptions[key] = {};
        });

        this.observable.subscribe(_ => {
            this.updateInterface();
        })

        this.interface = null;
        this.updateInterface();
    }

    updateInterface() {
        this.interface = this.createReactiveInterface();
    }

    mutate(mutation, message = "") {
        new DirectoryMutation(this, mutation).commit(message)

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
            const result = this._asObject(this.directory.structure, this.interface, relationDeepness)
            this._applyComputed(result);
            this._applyMutations(result);
            return result;
        }else
            return null;
    }

    update() {
        this.observable.next(this.state);
    }



    createReactiveInterface() {
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


    _applyComputed(reactiveInterface){
        Object.entries(this.directory.computed).forEach(([key, value]) => {
            reactiveInterface[key] = value.call(reactiveInterface)
        });
    }

    _applyMutations(reactiveInterface){
        Object.entries(this.directory.mutations).forEach(([key, value]) => {
            reactiveInterface[key] = value.bind(reactiveInterface)
        })
    }


    _mapObserverToSource(item = {}, structure, stateProvider) {
        const store = this.store;
        const directorySubject = this;
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
                    if (directorySubject.isSubscriberOf(relationName, relationID)) {

                    } else {
                        directorySubject.subscribe(relationName, relationID)(({ payload, source }) => {
                            directorySubject.update();
                        });
                    }
                }
                Object.defineProperty(item, key, {
                    get() {
                        return R.path(['interface'], initialSubject);
                    },
                    set(value) {
                        stateProvider.set(key, value);

                        directorySubject.unsubscribe(relationName, value);

                        initialSubject = store.getOrCreateEntitySubject(relationName, value);
                        directorySubject.subscribe(relationName, value)(({ payload, source }) => {
                            directorySubject.update()
                        });
                    }
                })
            } else if (TypeChecker.isAttributeArray(structure[key])) {
                Object.defineProperty(item, key, {
                    get() {
                        const extendedArray = stateProvider.get(key);
                        extendArray(extendedArray, (newArray) => {
                            stateProvider.set(key, newArray);
                        });
                        return extendedArray;
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
                    if (directorySubject.isSubscriberOf(relationName, relationID)) {

                    } else {
                        directorySubject.subscribe(relationName, relationID)(({ payload, source }) => {
                            directorySubject.update()
                        });
                    }
                    return subject;
                });
                Object.defineProperty(item, key, {
                    get() {
                        const extendedArray = subjects.map(it => it.interface);
                        extendArray(extendedArray, (newArray) => {
                            stateProvider.set(key, newArray);
                        });
                        return extendedArray;
                    },
                    set(relationIDs) {
                        stateProvider.set(key, relationIDs);
                        subjects.forEach(subject => {
                            directorySubject.unsubscribe(relationName, subject.id);
                        })

                        subjects = relationIDs.map(relationID => {
                            const subject = store.getOrCreateEntitySubject(relationName, relationID);
                            if (directorySubject.isSubscriberOf(relationName, relationID)) {

                            } else {
                                directorySubject.subscribe(relationName, relationID)(({ payload, source }) => {
                                    directorySubject.update()
                                });
                            }
                            return subject;
                        });
                    }
                })
            } else if (TypeChecker.isIdentifier(structure[key])) {
                Object.defineProperty(item, key, {
                    get() {
                        return directorySubject.id;
                    },
                    set(value) {

                    }
                })
            } else {
                const get = (key2) => {
                    return stateProvider.get(key)[key2];
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

    equals(directorySubject) {
        return this === directorySubject;
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
        return `"#${this.name}"`
    }
}