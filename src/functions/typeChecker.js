import {types} from '../Model';

export const isAttribute = (type) => {
    const attributeKeys = [
        types.String.type,
        types.Number.type,
        types.Boolean.type,
    ]
    return attributeKeys.includes(type.type);
}



export const isIdentificator = (type) => {
    return type.type === types.Identificator.type;
}

export const isReference = (type) => {
    return type.type === types.Reference().type;
}


export const isAttributeArray = (type) => {
    return type.type === types.Array().type && type.arrayOfType.type !== types.Reference().type;
}


export const isReferenceArray = (type) => {
    return type.type === types.Array().type && type.arrayOfType.type === types.Reference().type;
}