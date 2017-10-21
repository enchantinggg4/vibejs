import { types } from '../Model';
import {isAttribute, isReference, isIdentificator, isAttributeArray, isReferenceArray} from './typeChecker';

export const transformAttribute = (attribute) => {
    return attribute;
}

export const transformReference = (reference) => {
    const isNumber = (v) => typeof (v) === 'number' || v instanceof Number
    if (isNumber(reference)) {
        // reference by id
        return reference;
    } else if (!reference) {
        // nullate relation
        return null;
    } else if (reference.id)
        // reference by entity
        return reference.id;
    else
        // whatever else is shit
        return null;
    
}

export const transformReferenceArray = (array) => {
    if(Array.isArray(array))
        return array.map(it => transformReference(it));
    else
        return []
}

const setObservableAttribute = (item, key, type, stateProvider, updateState, store) => {
    Object.defineProperty(item, key, {
        get() {
            return stateProvider()[key];
        },
        set(value) {
            stateProvider()[key] = transformAttribute(value);
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

            const referenceID = transformReference(value);
            stateProvider()[key] = referenceID;

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
            const transformedArray = transformReferenceArray(value);
            stateProvider()[key] = transformedArray;
            subscribers = transformedArray.map(id => {
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

const collectObservable = (observable, structure, deepness) => {
    const json = {};
    Object.keys(structure).forEach(key => {
        if(isAttribute(structure[key])){
            json[key] = observable[key];
        }else if(isReference(structure[key])){
            if (observable[key] && deepness > 0) {
                json[key] = observable[key].$json(deepness - 1);
            } else {
                json[key] = null;
            }
        }else if(isReferenceArray(structure[key])){
            json[key] = deepness > 0 && observable[key].map(it => {
                if (it) {
                    return it.$json(deepness - 1)
                } else {
                    return null;
                }
            }) || [];
        }else if(isAttributeArray(structure[key])){
            json[key] = observable[key];
        }else if(isIdentificator(structure[key])){
            json[key] = observable[key];            
        }else{
            // console.log(JSON.stringify(structure), key, observable)
            json[key] = collectObservable(observable[key], structure[key], deepness)
        }
    });
    return json;
}


const createObservableObject = (reactiveItem = {}, structure, stateProvider, updateState, store) => {
    Object.keys(structure).forEach(key => {
        if(isAttribute(structure[key])){
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);            
        }else if(isReference(structure[key])){
            setObservableReference(reactiveItem, key, structure[key], stateProvider, updateState, store);            
        }else if(isAttributeArray(structure[key])){     
            setObservableAttribute(reactiveItem, key, structure[key], stateProvider, updateState, store);            
        }else if(isReferenceArray(structure[key])){ 
            setObservableReferenceArray(reactiveItem, key, structure[key], stateProvider, updateState, store);            
        }else if(isIdentificator(structure[key])){
            setFreezedId(reactiveItem, reactiveItem["id"]);            
        }else{
            reactiveItem[key] = {};
            createObservableObject(reactiveItem[key], structure[key], () => stateProvider()[key], updateState, store);            
        }

    });
    reactiveItem.$json = function(deepness = 2){
        return collectObservable(reactiveItem, structure, deepness)
    };

    return reactiveItem;
}

const merge = (structure, objectToMerge, stateProvider, updateState) => {
    Object.keys(objectToMerge).forEach(key => {
        if(isAttribute(structure[key])){
            stateProvider()[key] = transformAttribute(objectToMerge[key]);
        }else if(isReference(structure[key])){
            stateProvider()[key] = transformReference(objectToMerge[key]);
        }else if(isAttributeArray(structure[key])){     
            stateProvider()[key] = transformAttribute(objectToMerge[key]);          
        }else if(isReferenceArray(structure[key])){
            stateProvider()[key] = transformReferenceArray(objectToMerge[key]);                          
        }else{
            merge(structure[key], objectToMerge[key], () => stateProvider()[key], updateState)
        }
    });
}


export default function createObservable (reactiveItem = {}, structure, stateProvider, updateState, store) {
    createObservableObject(reactiveItem, structure, stateProvider, updateState, store);
    reactiveItem.$merge = function(objectToMerge){
        merge(structure, objectToMerge, stateProvider, updateState);
        updateState();
    }
    return reactiveItem;
}