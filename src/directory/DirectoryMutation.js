// import R from 'ramda';
const R = require('ramda')

export default class DirectoryMutation{
    constructor(subject, payload){
        this.subject = subject;
        const originalState = subject.directory.state;
        this.resultState =  R.mergeDeepRight(originalState, payload);
    }

    commit(message){
        this.subject.directory.state = this.resultState;
        this.subject.update();
    }
}