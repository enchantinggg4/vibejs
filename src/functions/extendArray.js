export default (arrayToExtend, onNewArray) => {
    arrayToExtend.push = function (item) {
        const newArray = arrayToExtend.concat([item]);
        onNewArray(newArray);
    }
}