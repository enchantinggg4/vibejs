import * as TypeChecker from './typeChecker';
import * as R from 'ramda';
import isNumber from 'is-number';

const _processReference = (value, stateProvider) => {
    if (isNumber(value)) {
        return value;
    } else if (value == null) {
        return value;
    } else if ('id' in value && isNumber(value.id)) {
        return value.id
    } else {
        throw new Error("Invalid reference: expected id, null or subject")
    }
}
const createReactiveInterface =  ({ item, stateProvider, store, updateState, structure, subscribe, unsubscribe }) => {
    Object.entries(structure).forEach(([key, value]) => {
        if (TypeChecker.isAttribute(structure[key])) {
            Object.defineProperty(item, key, {
                get() {
                    return stateProvider.get(key);
                },
                set(value) {
                    stateProvider.set(key, value);
                }
            })
        } else if (TypeChecker.isReference(structure[key])) {
            const relationName = structure[key].model;
            const relationID = stateProvider.get(key);
            let initialSubject = null;
            if (relationID) {
                initialSubject = store.getOrCreateEntitySubject(relationName, relationID);
                subscribe(relationName, relationID);     
            }
            Object.defineProperty(item, key, {
                get() {
                    return R.path(['interface'], initialSubject);
                },
                set(value) {
                    if (initialSubject) {
                        unsubscribe(relationName, initialSubject.id);
                    }

                    const refID = _processReference(value, stateProvider);
                    stateProvider.set(key, refID);
                    if (refID) {
                        initialSubject = store.getOrCreateEntitySubject(relationName, refID);
                        subscribe(relationName, relationID);
                    }
                }
            })
        } else if (TypeChecker.isAttributeArray(structure[key])) {
            Object.defineProperty(item, key, {
                get() {
                    return stateProvider.get(key);
                },
                set(value) {
                    stateProvider.set(key, value);
                }
            })
        } else if (TypeChecker.isReferenceArray(structure[key])) {
            const relationName = structure[key].arrayOfType.model;
            const relationIDs = stateProvider.get(key);
            let subjects = [];
            subjects = relationIDs.map(relationID => {
                const subject = store.getOrCreateEntitySubject(relationName, relationID);
                subscribe(relationName, relationID)
                return subject;
            });
            Object.defineProperty(item, key, {
                get() {
                    return subjects.map(it => it.interface);
                },
                set(relationIDs) {
                    subjects.forEach(subject => {
                        unsubscribe(relationName, subject.id);
                    });
                    subjects = relationIDs.map(value => {
                        const refID = _processReference(value, stateProvider);
                        if (refID) {
                            const initialSubject = store.getOrCreateEntitySubject(relationName, refID);
                            subscribe(relationName, refID);
                            return initialSubject;
                        }
                    });
                    stateProvider.set(key, subjects.map(it => it.id));
                }
            })
        } else if (TypeChecker.isIdentifier(structure[key])) {
            Object.defineProperty(item, key, {
                get() {
                    
                    return stateProvider.get('id')
                },
                set(value) {

                }
            })
        } else {
            const get = (key2) => {
                if (stateProvider.get(key))
                    return stateProvider.get(key)[key2];
                else
                    throw new Error(`Trying to read not existing entity`)
            }
            const set = (key2, value) => {
                stateProvider.set(key, {
                    [key2]: value
                })
            }

            item[key] = createReactiveInterface({
                item: {},
                stateProvider: {
                    get,
                    set
                },
                store: store,
                updateState: updateState,
                structure: structure[key],
                subscribe: subscribe,
                unsubscribe: unsubscribe
            })

        }
    });
    return item;
}

export default createReactiveInterface;