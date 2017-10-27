// import R from 'ramda';
import * as R from 'ramda';

/**
 * @class {DirectoryMutation}
 */
export default class DirectoryMutation{
    /**
     * Construct mutation
     * @param {EntitySubject} subject 
     * @param {Object} payload 
     */
    constructor(subject, payload){
        /**
         * 
         * @member {DirectorySubject} - directory subject
         */
        this._subject = subject;
        /**
         * State before mutation
         * @member {Object}
         */
        this.originalState = subject.directory.state;
        /**
         * State after mutation
         * @member {Object}
         */
        this.resultState =  R.mergeDeepRight(this.originalState, payload);
    }

    /**
     * Apply mutation
     * @param {string} message - message with commit
     */
    commit(message){
        this._subject.directory.state = this.resultState;
        this._subject.update();
    }
}