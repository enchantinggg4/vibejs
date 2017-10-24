import types from '../types';

export const isAttribute = (type) => {
    return types.Attribute.type === type.type;
}



export const isIdentifier = (type) => {
    return type.type === types.Identifier.type;
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