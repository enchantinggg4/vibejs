# Vibe

## Install

`yarn add vibejs`
`npm install vibejs`

Hi there, this is reactive state management tool for JavaScript.

There are 3 core concepts:
1) Model
2) EntityStore
3) Struct

## Model

Model is description of entity.

You can describe it like this:
```js
const User = new Model('User', {
    structure: {
        name: types.String,
        boy: types.Boolean,
        bestFriend: types.Rerefence('User'),
        friends: types.Array(types.Reference('User')),
    }
});
```

After this, you can insert new entity and observe it.

```js
User.insertEntity({
    id: 1,
    name: "Vasya",
    boy: true,
    bestFriend: null, // null reference is allowed
    friends: [] // well, that's sad     
});
const vasya = User.observe(1);
```

What happens:
1) You push json into model's `insertEntity` method
2) Model checks its structure, types and etc
3) Model pushes entity into store
4) Store notifies everybody, who is observing entity of `User` type and `id=1`.

Need to say, you can observe entity which doesn't exist yet - you will get default values for keys.

At this point you already can use `vasya` to access and change reactive data. For example

```js
User.insertEntity({
    id: 2,
    name: "Petya"
});
vasya.bestFriend = 2; // access relation directly by i
vasya.bestFriend = User.observe(2) // or by entity
vasya.bestFriend.name = "Ivan"
// after this line User#2 will have name equals `Ivan`
```

But we want to compose different data, like models or just primitives.

To do this, we need to define `Struct`

```js
const groupStruct = new Struct({
   structure: {
        name: types.String,
        author: types.Reference('User'),
        users: types.Array(types.Reference('User'))
    } 
}, Store);
const group = groupStruct.observe();
group.author = petya;
group.users = [vasya, petya];
```

Structs have no identificator. It is just structure of document you need.

So, at some point it's nice already.
But what about changes? Nice question. Reacting only for necessary data changes is core point of Vibe. 

Here are examples how you subscribe to changes of entity
```js
vasya.$observable.subscribe(entity => {
    console.log("Hey there! My relation or attribute has changed!");
})
```

... or to struct
```js
group.$observable.subscribe(struct => {
    console.log("Hey again! Something changed in my structure!");
});
```

It means, you won't need to react to all changes, like in `Redux`.
You create structure for a concrete task. You define relationships and your struct will only get updated if this relationships are updated(and they will update if their relationships are updated and like this...).

