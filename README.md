# Vibe.js

## Install

`yarn add vibejs`

`npm install vibejs`

## Tests

`yarn test`

For now vibejs has 34 tests.

## Documentation
[Github pages](https://vibe-js.github.io/)
## Core 

There are 3 core concepts:
1) Model and EntitySubject
2) EntityStore
3) Directory and DirectorySubject

## Model

Model is description of entity.

You can describe it like this:
```js
const User = new Model('User', {
    structure: {
        name: types.Attribute,
        mother: types.Reference('User'), // reference to entity with name 'User'
        mother: types.Reference('User'), //same
        wrappedValues: { // you can create wrapped structures
            age: types.Attribute
        }
    },
    computed: {
        upperCaseName(){
            return this.name.toUpperCase()
        }
    },
    mutations: {
        setName(newName){
            this.name = newName;
        }
    }
});
```

After this, you can insert new entity and observe it.

```js
User.insertEntity(1, {
    name: "Elon Musk",
    mother: 2, // reference by id,
    father: User.observe(3).interface, // or by subject interface
    wrappedValues: {
        age: 46
    } 
});
const subject = User.observe(1);
```

What happens:
1) You push json into model's `insertEntity` method
2) Model checks its structure and sets default if not set
3) Model pushes entity into store
4) Store notifies everybody, who is observing entity of type `User` and `id=1`.

And now we got subject. In vibejs subject is object to work with entity.


At this point you already can use `subject` to access and change reactive entity's data. For example

```js
User.insertEntity(5, {
    name: "Errol Musk",
});
const reactiveInterface = subject.interface;
reactiveInterface.father = 5; // access relation directly by i
reactiveInterface.father = User.observe(5).interface // or by subject's interface
reactiveInterface.father.name = "Somebody else"
// after this line User#5 will have name equals `Somebody else` and user#1 will get updated
```

But we want to compose different data, like models or just primitives. For example, if you need screen, where user supposed to change his name.
We need to compose `newUserName` and entity he updates.

To do this, we need to define `Directory`

```js
const UpdateProfileDirectory = new Directory('UpdateProfile', {
    structure: {
        newUserName: types.Attribute,
        profile: types.Reference('User')
    },
    mutations: {
        commitNewName(){
            /* fetch(...).then(response => {
                User.observe(this.profile.id)
                    .mutate(response, 'Updated from updateProfile')
            })*/
            // we can commit our mutations with text message for debugging purposes.
        }
    }
}, Store)
```

Directory has no identifier. It is just structure of document you need.

So, at some point it's nice already.
But what about changes? Reacting only for necessary data changes is core point of Vibe.
It means, any subject won't get updated if its attribute is not updated or its relation is not updated.

Here are examples how you subscribe to changes of entity
```js
subject.observable.subscribe(({payload, source}) => {
    // payload is structure from store
    // source - subject which caused update
    
})
```

... or to directory
```js
UpdateProfileDirectory.observable.subscribe(state => {
    // state - inner structure, like entity's in the store
    /*
        renderComponent();
    */
});
```

It means, you won't need to react to all changes, like in `Flux` solutions.

You create structure for a concrete task. You define relationships and your durectory will only get updated if this relationships are updated(and they will update if their relationships are updated and like this...).


TODO: 
1) JSONifying subjects 
2) Persistence of store and directories
3) Examples with vue, react.

