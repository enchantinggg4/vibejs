import R from 'ramda';

export default class DirectoryMutation{
    constructor(subject, payload){
        this.subject = subject;
        const originalState = subject.directory.state;
        alert(R + "HERE WE GO ")
        this.resultState =  R.mergeDeepRight(originalState, payload);
    }

    commit(message){
        this.subject.directory.state = this.resultState;
        this.subject.update();
    }
}