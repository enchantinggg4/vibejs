import Rx from 'rxjs/Rx'
import setComputedProperty from '../functions/setComputedProperty'
import * as TypeChecker from '../functions/typeChecker'
import {types} from '../entity/Model';
import DirectorySubject from './DirectorySubject';

/**
 * @class {Directory}
 */
export default class Directory {
    /**
     * Create directory
     * @param {string} name - directory name
     * @param {Object} options - structure, computed, mutations
     * @param {EntityStore} store - {@link EntityStore} instance
     * @see {@link EntityStore}
     */
    constructor(name, options = { structure: {}, computed: {}, mutations: {} }, store) {
        /**
         * Directory name
         * @member {string}
         */
        this.name = name;
        /**
         * Directory structure
         * @member {Object}
         */
        this.structure = options.structure || {};
        /**
         * Computed values declared in constructor
         * @member {Object}
         */
        this.computed = options.computed || {};
        /**
         * Methods declared in constructor
         * @member {Object}
         */
        this.mutations = options.mutations || {};
        /**
         * Local state
         * @member {Object}
         */
        this.state = {};
        this._initialState(this.structure, this.state);
        /**
         * Subject of this directory
         */
        this._subject = new DirectorySubject(this, store);
    }

    /**
     * Clear local state and initialise default
     */
    clear(){
        this.state = {};
        this._initialState(this.structure, this.state);
    }

    /**
     * Initialise state
     * @param {Object} structure - structure to translate
     * @param {*} state - state where to write
     */
    _initialState(structure, state){
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
                this._initialState(structure[key], state[key])
            }
        })
    }

    /**
     * Return {@link DirectorySubject} of this directory
     * @returns {DirectorySubject}
     */
    observe(){
        return this._subject;
    }
    
}