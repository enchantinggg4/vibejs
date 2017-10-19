export default function setComputedProperty(item, key, computer){
    Object.defineProperty(item, key, {
        get(){
            try{
                return computer.bind(item)()
            }catch(e){
                return null;
            }
        },
        set(val){
            // ignore, immutable
        }
    });
}