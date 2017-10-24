import Rx from 'rxjs/Rx'
import setComputedProperty from '../functions/setComputedProperty'
import * as TypeChecker from '../functions/typeChecker'
import {types} from '../entity/Model';
import DirectorySubject from './DirectorySubject';

export default class Directory {
    constructor(name, options = { structure: {}, computed: {} }, store) {
        this.name = name;
        this.computed = options.computed || {};
        this.structure = options.structure || {};
        this.computed = options.computed || {};
        this.mutations = options.mutations || {};
        this.store = store;
        this.state = {};
        this.initialState(this.structure, this.state);
        this.subject = new DirectorySubject(this, store);
    }

    clear(){
        this.state = {};
        this.initialState(this.structure, this.state);
    }

    initialState(structure, state){
        Object.entries(structure).forEach(([key, value]) => {
            if(TypeChecker.isAttribute(structure[key])){
                state[key] = structure[key].default();
            }else if(TypeChecker.isAttributeArray(structure[key])){
                state[key] = [];
            }else if(TypeChecker.isReference(structure[key])){
                state[key] = null;
            }else if(TypeChecker.isReferenceArray(structure[key])){
                state[key] = [];
            }else{
                //object
                state[key] = {};
                this.initialState(structure[key], state[key])
            }
        })
    }

    observe(){
        return this.subject;
    }
    
}