import R from 'ramda';

export default class Mutation{
    constructor(subject, payload){
        this.subject = subject;
        const originalState = subject.store.heap[subject.name][subject.id];
        delete payload.id; // we just don't want to modify id, right?
        this.resultState =  R.mergeDeepRight(originalState, payload);
    }

    commit(message){
        this.subject.store.updateEntity(this.subject.name, this.subject.id, this.resultState, this.subject, message);
    }
}