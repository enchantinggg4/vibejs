import Rx from 'rxjs/Rx'
import setComputedProperty from '../functions/setComputedProperty'
import types from '../types';
import * as TypeChecker from '../functions/typeChecker';

export default class Model {
    constructor(name, options = { structure: {}, computed: {}, mutations: {} }) {
        this.name = name;
        this.computed = options.computed || {};
        this.structure = options.structure || {};
        this.mutations = options.mutations || {};
        this.structure.id = types.Identifier;
        this.store = null;
    }

    attachStore(store) {
        this.store = store;
    }

    allEntities(){
        return this.store.allEntities(this.name);
    }

    fillDefaultValues(structure, item){
        Object.entries(structure).forEach(([key, value]) => {
            if(TypeChecker.isAttribute(structure[key])){
                if(!(key in item))
                    item[key] = structure[key].default();
            }else if(TypeChecker.isReference(structure[key])){
                if(!(key in item))
                    item[key] = structure[key].default();
            }else if(TypeChecker.isReferenceArray(structure[key])){
                if(!(key in item))
                    item[key] = structure[key].default();
            }else if(TypeChecker.isAttributeArray(structure[key]) ){
                if(!(key in item))
                    item[key] = structure[key].default();
            }else if(TypeChecker.isIdentifier(structure[key])){
                // we check this already
            }else{
                if(!(key in item))
                    item[key] = {};
                this.fillDefaultValues(structure[key], item[key]);
            }
        });
    }

    insertEntity(id, item) {
        if(id){
            const emptyItem = {};
            this.fillDefaultValues(this.structure, emptyItem);
            this.fillDefaultValues(this.structure, item);
            this.store.putEntity(this.name, id, emptyItem);
            this.store.putEntity(this.name, id, item);
        }else{
            throw new Error("Entity's id cannot be null or zero");
        }
    }

    observe(id){
        if(this.store){
            return this.store.getOrCreateEntitySubject(this.name, id);
        }else{
            throw new Error(`Model ${this.name} is not attached to a store.`)
        }
    }
    
}

