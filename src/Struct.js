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

    observe(){
        this.state = this.defaultStructure();
        const observable = new Rx.Subject();
        
        const reactiveItem = createObservable({}, this.structure, () => this.state, () => observable.next(), this.store);
        
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

        Object.keys(this.computed).forEach(key => {
            setComputedProperty(reactiveItem, key, this.computed[key])
        })
        return reactiveItem;
    }
}