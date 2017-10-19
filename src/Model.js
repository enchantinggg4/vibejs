import Rx from 'rxjs/Rx'
import setComputedProperty from './functions/setComputedProperty'
export default class Model {
    constructor(name, options = { structure: {}, computed: {} }) {
        this.name = name;
        this.computed = options.computed;
        this.structure = options.structure;
        this.store = null;
        this.structure.id = types.Identificator

    }

    attachStore(store) {
        this.store = store;
    }

    insertEntity(item) {
        const validation = this.validateItem(item);
        if (validation) {
            Object.keys(this.structure).forEach(key => {
                if(!item[key])
                    item[key] = this.structure[key].default()
            })
            this.store.pushToHeap(this.name, item);
        } else {
            throw new Error("Wrong json structure for model " + this.name);
        }
    }

    validateKeyValue(key, value){
        if (this.structure[key].type === types.Identificator.type && types.Identificator.check(value)) {
            return true
        } else if (this.structure[key].type === types.String.type && types.String.check(value)) {
            return true
        } else if (this.structure[key].type === types.Number.type && types.Number.check(value)) {
            return true
        } else if (this.structure[key].type === types.Boolean.type && types.Boolean.check(value)) {
            return true
        } else if (this.structure[key].type === types.Array().type && this.structure[key].check(value)) {
            return true
        } else if (this.structure[key].type === types.Reference().type && types.Reference().check(value)) {
            return true
        } else {
            return false
        }
    }

    validateItem(item) {
        return Object.keys(item).map(key => {
            const value = item[key];
            return this.validateKeyValue(key, value)
        }).reduce((a, b) => a && b);
    }


    defaultStructure(id) {
        const skeleton = {
            id: id
        };
        Object.keys(this.structure).forEach(key => {
            if (this.structure[key].type == types.Identificator.type) {

            } else if (this.structure[key].type == types.Reference.type) {
                skeleton[key] = this.structure[key].default();
            } else {
                skeleton[key] = this.structure[key].default();
            }

        });
        return skeleton;
    }


    observe(id) {
        if (!this.store.entityExists(this.name, id)) {
            this.insertEntity(this.defaultStructure(id));
        }

        const model = this;
        const store = this.store;

        const setObservableAttribute = (item, key, type) => {
            Object.defineProperty(item, key, {
                get() {
                    if (store.heap[model.name][item.id])
                        return store.heap[model.name][item.id][key];
                    return model.structure[key].default();
                },
                set(value) {
                    if (store.heap[model.name][item.id]) {
                        store.heap[model.name][item.id][key] = value;
                        store.updateEntity(model.name, item.id)
                    }
                }
            })
        };

        const setObservableReference = (item, key, ref) => {
            Object.defineProperty(item, key, {
                get() {
                    const refId = store.heap[model.name][item.id][key];
                    if (refId)
                        return store.models[model.structure[key].model].observe(refId);
                    return null;
                },
                set(value) {
                    const isNumber = (v) => typeof (v) === 'number' || v instanceof Number
                    if (isNumber(value)) {
                        // reference by id
                        store.heap[model.name][item.id][key] = value;
                    } else if (!value) {
                        // nullate relation
                        store.heap[model.name][item.id][key] = null;
                    } else {
                        if (value.id) {
                            store.heap[model.name][item.id][key] = value.id;
                        } else {
                            throw new Error("Expected object with identificator, got", value);
                        }
                    }

                    const refId = store.heap[model.name][item.id][key]

                    if (refId) {
                        store.subscribeEntity(ref.model, refId).subscribe(_ => {
                            store.updateEntity(model.name, item.id)
                        })
                    }

                    store.updateEntity(model.name, item.id)
                }
            })
        };

        const setObservableReferenceArray = (item, key, ref) => {
            Object.defineProperty(item, key, {
                get() {
                    const refsID = store.heap[model.name][item.id][key];
                    return refsID.map(id => store.models[ref.arrayOfType.model].observe(id));
                },
                set(value) {
                    if(Array.isArray(value)){
                        if(value.length === 0){
                            store.heap[model.name][item.id][key] = [];
                        }else{
                            store.heap[model.name][item.id][key] = value.map(item => {
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
                            store.updateEntity(model.name, item.id)
                        })
                    })
                    store.updateEntity(model.name, item.id)
                }
            })
        };

        const setFreezedId = (item, value) => {
            Object.defineProperty(item, 'id', {
                get() {
                    return value;
                },
                set(value) {
                    // ignore set, it's immutable
                }
            })
        }

        const observable = new Rx.Subject();
        const reactiveItem = {
            $observable: store.subscribeEntity(model.name, id),
            $json() {
                const json = {};
                Object.keys(model.structure).forEach(key => {
                    if (model.structure[key].type === 'Reference') {
                        if (this[key]) {
                            json[key] = this[key].$json();
                        } else {
                            json[key] = null;
                        }
                    }else if (model.structure[key].type === 'Array' && model.structure[key].arrayOfType.type === types.Reference().type) {
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
        setFreezedId(reactiveItem, id);
        Object.keys(model.structure).forEach(key => {
            if (model.structure[key].type === types.Reference().type) {
                setObservableReference(reactiveItem, key, this.structure[key]);
            } else if (model.structure[key].type === types.Array().type && model.structure[key].type === types.Reference().type) {
                setObservableReferenceArray(reactiveItem, key, this.structure[key]);
            } else if (model.structure[key].type === types.Array().type && model.structure[key].type !== types.Reference().type) {
                setObservableAttribute(reactiveItem, key, this.structure[key]);
            } else if (model.structure[key].type === types.Identificator.type) {

            } else
                setObservableAttribute(reactiveItem, key, this.structure[key]);
        });
        Object.keys(model.computed).forEach(key => {
            setComputedProperty(reactiveItem, key, model.computed[key])
        })
        return reactiveItem;
    }
}


export const types = {
    String: {
        type: String,
        check(value) {
            return typeof (value) === 'string' || value instanceof String || !value
        },
        default() {
            return "";
        }
    },
    Number: {
        type: Number,
        check(value) {
            return typeof (value) === 'number' || value instanceof Number || !value
        },
        default() {
            return 0;
        }
    },
    Boolean: {
        type: Boolean,
        check(value) {
            return typeof (value) === 'boolean' || value instanceof Boolean || !value
        },
        default() {
            return false;
        }
    },
    Identificator: {
        type: 'Identificator',
        check(value) {
            return typeof (value) === 'number' || value instanceof Number || !value
        }
    },
    Array: (Type) => {
        return {
            type: 'Array',
            arrayOfType: Type,
            check(value){
                return Array.isArray(value) && (value.length === 0 || this.arrayOfType.check(value[0]));
            },
            default(){
                return [];
            }
        }
    },
    Reference: (Model) => {
        return {
            type: 'Reference',
            model: Model,
            default() {
                return null;
            },
            check(value) {
                const isNumber = (v) => typeof (v) === 'number' || v instanceof Number
                return isNumber(value) || !value || isNumber(value.id)
            }
        }
    }
}