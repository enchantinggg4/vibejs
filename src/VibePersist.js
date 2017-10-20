export const serializeStore = (store) => {
    return JSON.stringify(store.toJSON());
};

export const loadStore = (serializedHeap, store) => {
    const heap = JSON.parse(serializedHeap);
    store.heap = heap;
}