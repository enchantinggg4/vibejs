const R = require('ramda')
import Rx from 'rxjs/Rx';
import EntitySubject from './entity/EntitySubject';

export default class {
    constructor(models){
        this.modelsArray = models;
        this.models = {};
        this.heap = {};
        this.observables = {};
        this.setupModelsAndHeap(models);
    }

    updateEntity(name, id, value, source, message=''){
        this.heap[name][id] = value;
        this.entityUpdated(name, id, source);
    }

    setupModelsAndHeap(models){
        models.forEach(model => {
            this.models[model.name] = model;
            this.heap[model.name] = {};
            this.observables[model.name] = {};
            model.attachStore(this);
        });
    }

    clear(){
        this.setupModelsAndHeap(this.modelsArray);
    }

    putEntity(name, id, value){
        this.heap[name][id] = value;
        this.getOrCreateEntitySubject(name, id).updateInterface();
    }

    deleteEntity(name, id){
        delete this.heap[name][id];
        this.getOrCreateEntitySubject(name, id).updateInterface();    
    }

    getOrCreateEntitySubject(name, id){
        const observable = this.observables[name][id];
        if(observable)
            return observable;
        else 
            return this.createEntitySubject(name, id);
    }

    createEntitySubject(name, id){
        this.observables[name][id] = new EntitySubject(name, id, new Rx.Subject(), this.models[name], this);
        return this.observables[name][id];
    }


    entityUpdated(name, id, source){
        this.getOrCreateEntitySubject(name, id).observable.next({
            payload: this.heap[name][id],
            source
        });
    }
}