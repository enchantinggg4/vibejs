import Rx from 'rxjs/Rx'
import {types} from './Model'
import setComputedProperty from './functions/setComputedProperty'
import createObservable from './functions/createObservable'

export default class Struct {
    constructor(options={structure: {}, computed: {}}, store){
        this.computed = options.computed || {};
        this.structure = options.structure || {};
        this.store = store;
        this.state = {};
    }

    defaultStructure(structure) {
        const skeleton = {};
        Object.keys(structure).forEach(key => {
            if (structure[key].type == types.Identificator.type) {

            } else if (structure[key].type == types.Reference().type) {
                skeleton[key] = structure[key].default();
            } else if (structure[key].type == types.String.type) {
                skeleton[key] = structure[key].default();
            } else if (structure[key].type == types.Number.type) {
                skeleton[key] = structure[key].default();
            } else if (structure[key].type == types.Boolean.type) {
                skeleton[key] = structure[key].default();
            } else if (structure[key].type == types.Array().type) {
                skeleton[key] = structure[key].default();
            } else {
                skeleton[key] = this.defaultStructure(structure[key]);
            }
        });
        return skeleton;
    }

    observe(){
        this.state = this.defaultStructure(this.structure);
        const observable = new Rx.Subject();
        
        const reactiveItem = createObservable({}, this.structure, () => this.state, () => observable.next(), this.store);
        
        Object.defineProperty(reactiveItem, "$observable", {
            get() {
                return observable;
            },
            set() {

            }
        });   

        Object.keys(this.computed).forEach(key => {
            setComputedProperty(reactiveItem, key, this.computed[key])
        })
        return reactiveItem;
    }
}