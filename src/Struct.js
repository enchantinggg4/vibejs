import Rx from 'rxjs/Rx'
import {types} from './Model'
import setComputedProperty from './functions/setComputedProperty'
export default class Struct {
    constructor(options={structure: {}, computed: {}}, store){
        this.structure = options.structure;
        this.computed = options.computed;
        this.store = store;
        this.state = {};
    }

    defaultStructure(id) {
        const skeleton = {
            
        };
        Object.keys(this.structure).forEach(key => {
            if (this.structure[key].type == types.Reference.type) {
                skeleton[key] = this.structure[key].default();
            } else {
                skeleton[key] = this.structure[key].default();
            }

        });
        return skeleton;
    }

    setObservableReference(item, key, ref){
        const struct = this;
        const store = this.store;
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
    }

    setObservableReferenceArray(item, key, ref){
        const struct = this;
        const store = this.store;
        Object.defineProperty(item, key, {
            get() {
                const refsID = struct.state[key];
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
                struct.state[key].forEach(id => {
                    store.subscribeEntity(ref.arrayOfType.model, id).subscribe(_ => {
                        item.$observable.next(item)
                    })
                });
                item.$observable.next(item);
            }
        })
    }

    setObservableAttribute(item, key, type){
        const struct = this;
        const store = this.store;
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
        });
    };

    observe(){
        this.state = this.defaultStructure();

        const struct = this;
        const store = this.store;

        

    

        // const setObservableReferenceArray = (item, key, ref) => ;

        const reactiveItem = {
            $observable: new Rx.Subject(),
            $subscribe(cb){
                return this.$observable.subscribe(cb)
            },
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
                struct.setObservableReference(reactiveItem, key, this.structure[key]);
            } else if (struct.structure[key].type === types.Array().type && struct.structure[key].arrayOfType.type === types.Reference().type) {
                struct.setObservableReferenceArray(reactiveItem, key, this.structure[key]);
            } else if (struct.structure[key].type === types.Array().type && struct.structure[key].arrayOfType.type !== types.Reference().type) {
                struct.setObservableAttribute(reactiveItem, key, this.structure[key]);
            } else
                struct.setObservableAttribute(reactiveItem, key, this.structure[key]);
        });

        Object.keys(struct.computed).forEach(key => {
            setComputedProperty(reactiveItem, key, struct.computed[key])
        })
        return reactiveItem;
    }
}