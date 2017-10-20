import Rx from 'rxjs/Rx'
import setComputedProperty from './functions/setComputedProperty'
import createObservable from './functions/createObservable';

export default class Model {
    constructor(name, options = { structure: {}, computed: {} }) {
        this.name = name;
        this.computed = options.computed || {};
        this.structure = options.structure || {};
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
                if (!item[key])
                    item[key] = this.structure[key].default()
            })
            this.store.pushToHeap(this.name, item);
        } else {
            throw new Error("Wrong json structure for model " + this.name);
        }
    }

    validateKeyValue(key, value) {
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
        if (!this.store.entityExists(this.name, id))
            this.insertEntity(this.defaultStructure(id));



        const observable = new Rx.Subject();
        const placeholder = {
            id: id
        };

        this.store.subscribeEntity(this.name, id).subscribe(a => {
            observable.next();
        })

        const reactiveItem = createObservable(placeholder, this.structure, () => this.store.heap[this.name][id], () => observable.next(), this.store);

        Object.keys(this.computed).forEach(key => {
            setComputedProperty(reactiveItem, key, this.computed[key])
        });
        Object.defineProperty(reactiveItem, "$observable", {
            get() {
                return observable;
            },
            set() {

            }
        });

        reactiveItem["$json"] = () => {
            const json = {};
            Object.keys(this.structure).forEach(key => {
                if (this.structure[key].type === 'Reference') {
                    if (this[key]) {
                        json[key] = this[key].$json();
                    } else {
                        json[key] = null;
                    }
                }else if (this.structure[key].type === 'Array' && this.structure[key].arrayOfType.type === types.Reference().type) {
                    json[key] = this[key].map(it => {
                        if (it) {
                            return it.$json();
                        } else {
                            return null;
                        }
                    })
                
                }else{
                    json[key] = reactiveItem[key];
                }
            });
            return json;
        }
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
            check(value) {
                return Array.isArray(value) && (value.length === 0 || this.arrayOfType.check(value[0]));
            },
            default() {
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