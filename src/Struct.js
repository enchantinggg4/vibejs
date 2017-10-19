import Rx from 'rxjs/Rx'
import {types} from './Model'

export default class Struct {
    constructor(structure, store){
        this.structure = structure;
        this.store = store;
        this.state = {};
    }


    observe(){
        
        const struct = this;
        const store = this.store;

        const setObservableAttribute = (item, key, type) => {
            Object.defineProperty(item, key, {
                get() {
                    if(struct.state[key])
                        return struct.state[key];
                    return struct.structure[key].default();
                },
                set(value) {
                    struct.state[key] = value;
                    item.$observable.next(item);
                }
            })
        };

        const setObservableReference = (item, key, ref) => {
            Object.defineProperty(item, key, {
                get() {
                    const refId = struct.state[key];
                    if (refId)
                        return store.models[struct.structure[key].model].observe(refId);
                    return null;
                },
                set(value) {
                    const isNumber = (v) => typeof (v) === 'number' || v instanceof Number
                    if (isNumber(value)) {
                        // reference by id
                        struct.state[key] = value;
                    } else if (!value) {
                        // nullate relation
                        struct.state[key] = null;
                    } else {
                        if (value.id) {
                            struct.state[key] = value.id;
                        } else {
                            throw new Error("Expected object with identificator, got", value);
                        }
                    }

                    const refId = struct.state[key]

                    if (refId) {
                        store.subscribeEntity(ref.model, refId).subscribe(_ => {
                            item.$observable.next(item);
                        })
                    }
                    item.$observable.next(item)
                }
            })
        };

        const setObservableReferenceArray = (item, key, ref) => {
            Object.defineProperty(item, key, {
                get() {
                    const refsID = structu.state[key];
                    return refsID.map(id => store.models[ref.arrayOfType.model].observe(id));
                },
                set(value) {
                    if(Array.isArray(value)){
                        if(value.length === 0){
                            struct.state[key] = [];
                        }else{
                            struct.state[key] = value.map(item => {
                                const isNumber = (v) => typeof (v) === 'number' || v instanceof Number
                                if(isNumber(item)){
                                    //set by id
                                    return item
                                }else if(!item){
                                    return null;
                                }else {
                                    return item.id
                                }
                            });
                        }
                    }else{
                        throw new Error("Expected array got ", value)
                    }
                    store.heap[model.name][item.id][key].forEach(id => {
                        store.subscribeEntity(ref.arrayOfType.model, id).subscribe(_ => {
                            item.$observable.next(item)
                        })
                    });
                    item.$observable.next(item);
                }
            })
        };

        const observable = new Rx.Subject();
        const reactiveItem = {
            $observable: new Rx.Subject(),
            $json() {
                const json = {};
                Object.keys(struct.structure).forEach(key => {
                    if (struct.structure[key].type === 'Reference') {
                        if (this[key]) {
                            json[key] = this[key].$json();
                        } else {
                            json[key] = null;
                        }
                    }else if (struct.structure[key].type === 'Array' && struct.structure[key].arrayOfType.type === types.Reference().type) {
                        json[key] = this[key].map(it => {
                            if (it) {
                                return it.$json();
                            } else {
                                return null;
                            }
                        })
                        
                    }else
                        json[key] = this[key];
                });
                return json;
            }
        };
        Object.keys(struct.structure).forEach(key => {
            if (struct.structure[key].type === types.Reference().type) {
                setObservableReference(reactiveItem, key, this.structure[key]);
            } else if (struct.structure[key].type === types.Array().type && struct.structure[key].type === types.Reference().type) {
                setObservableReferenceArray(reactiveItem, key, this.structure[key]);
            } else if (struct.structure[key].type === types.Array().type && struct.structure[key].type !== types.Reference().type) {
                setObservableAttribute(reactiveItem, key, this.structure[key]);
            } else if (struct.structure[key].type === types.Identificator.type) {

            } else
                setObservableAttribute(reactiveItem, key, this.structure[key]);
        });
        return reactiveItem;
    }
}