import * as R from 'ramda';

import * as TypeChecker from '../functions/typeChecker';
import DirectoryMutation from './DirectoryMutation';
import Rx from 'rxjs/Rx';
import extendArray from '../functions/extendArray';
import createReactiveInterface from '../functions/createReactiveInterface';

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
        createReactiveInterface({
            item: item,
            stateProvider: stateProvider,
            store: this.store,
            updateState(source){
                directorySubject.update();
            },
            structure: this.directory.structure,
            subscribe(name, id){
                if (!directorySubject.isSubscriberOf(name, id)) {
                    directorySubject.subscribe(name, id)(({ payload, source }) => {
                        directorySubject.update();
                    });
                }
            },
            unsubscribe(name, id){
                directorySubject.unsubscribe(name, id)
            }
        });
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