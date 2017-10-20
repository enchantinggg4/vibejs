import { types } from '../Model';

const setObservableAttribute = (item, key, type, stateProvider, updateState, store) => {
    Object.defineProperty(item, key, {
        get() {
            return stateProvider()[key];
        },
        set(value) {
            stateProvider()[key] = value;
            updateState();
        }
    })
}

const setObservableReference = (item, key, type, stateProvider, updateState, store) => {
    let subscriber = null;
    Object.defineProperty(item, key, {
        get() {
            const referenceID = stateProvider()[key];
            if (referenceID)
                return store.models[type.model].observe(referenceID);
            return null;
        },
        set(value) {
            if (subscriber)
                subscriber.unsubscribe();

            const isNumber = (v) => typeof (v) === 'number' || v instanceof Number
            if (isNumber(value)) {
                // reference by id
                stateProvider()[key] = value;
            } else if (!value) {
                // nullate relation
                stateProvider()[key] = null;
            } else {
                if (value.id)
                    stateProvider()[key] = value.id;
                else
                    throw new Error("Expected object with identificator, got", value);
            }

            const referenceID = stateProvider()[key]

            if (referenceID) {
                subscriber = store.subscribeEntity(type.model, referenceID).subscribe(_ => {
                    updateState();
                })
            }
            updateState();
        }
    })
};

const setObservableReferenceArray = (item, key, type, stateProvider, updateState, store) => {
    let subscribers = [];
    Object.defineProperty(item, key, {
        get() {
            const referenceIDS = stateProvider()[key];
            return referenceIDS.map(id => store.models[type.arrayOfType.model].observe(id));
        },
        set(value) {
            subscribers.forEach(it => it.unsubscribe());
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    stateProvider()[key] = [];
                } else {
                    stateProvider()[key] = value.map(item => {
                        const isNumber = (v) => typeof (v) === 'number' || v instanceof Number
                        if (isNumber(item)) {
                            //set by id
                            return item
                        } else if (!item) {
                            return null;
                        } else {
                            return item.id
                        }
                    });
                }
            } else {
                throw new Error("Expected array got ", value)
            }
            subscribers = stateProvider()[key].map(id => {
                return store.subscribeEntity(type.arrayOfType.model, id).subscribe(_ => {
                    updateState();
                })
            })
            updateState();
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


const setObservableObject = (item, key, stateProvider, updateState, store) => {
    createObservable(item[key],)
}


export default function createObservable (reactiveItem = {}, structure, stateProvider, updateState, store) {
    Object.keys(structure).forEach(key => {
        if (structure[key].type === types.Reference().type) {
            setObservableReference(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === types.Array().type && structure[key].arrayOfType.type === types.Reference().type) {
            // todo array methods proxy
            setObservableReferenceArray(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === types.Array().type && structure[key].arrayOfType.type !== types.Reference().type) {
            // todo array methods proxy
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === types.Identificator.type) {
            setFreezedId(reactiveItem, reactiveItem["id"]);
        } else if (structure[key].type === types.String.type) {
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === types.Number.type) {
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else if (structure[key].type === types.Boolean.type) {
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);
        } else {
            reactiveItem[key] = createObservable({}, structure[key], () => stateProvider()[key], updateState, store);
        }

    });
    reactiveItem.$json = function(){
        const json = {};
        Object.keys(structure).forEach(key => {
            if (structure[key].type === 'Reference') {
                if (this[key]) {
                    json[key] = this[key].$json();
                } else {
                    json[key] = null;
                }
            }else if (structure[key].type === 'Array' && structure[key].arrayOfType.type === types.Reference().type) {
                json[key] = this[key].map(it => {
                    if (it) {
                        return it.$json();
                    } else {
                        return null;
                    }
                })
            
            }else if(this[key].$json){
                json[key] = this[key].$json();
            }else{
                json[key] = reactiveItem[key];
            }
        });
        return json;
    }
    return reactiveItem;
}