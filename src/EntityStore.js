import Rx from 'rxjs/Rx'

export default class EntityStore{
    constructor(models){
        this.models = {};
        this.heap = {};
        this.observables = {};
        this.setupModelsAndHeap(models);
    }

    setupModelsAndHeap(models){
        models.forEach((element) => {
            this.models[element.name] = element;
            this.heap[element.name] = {};
            element.attachStore(this);
        });
    }

    pushToHeap(name, value){
        this.heap[name][value.id] = value;
        const observable = this.getEntityObservable(name, value.id);
        if(observable)
            observable.next(this.heap[name][value.id]);
    }

    subscribeEntity(name, id){
        if(!this.getEntityObservable(name, id))
            return this.createEntityObservable(name, id)
        return this.getEntityObservable(name, id)
    }

    getEntityObservable(name, id){
        const observableKey = JSON.stringify({ name, id });
        return this.observables[observableKey];
    }
    
    createEntityObservable(name, id){
        const observableKey = JSON.stringify({ name, id });
        this.observables[observableKey] = new Rx.Subject();
        return this.observables[observableKey];
    }

    updateEntity(name, id){
        const observable = this.getEntityObservable(name, id);
        if(observable)
            observable.next(this.heap[name][id])
    

    }

    entityExists(name, id){
        return !!this.heap[name][id];
    }


    toJSON(){
        return this.heap
    }
}