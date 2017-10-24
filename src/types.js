
export default  {
    Attribute: {
        type: 'Attribute',
        default() {
            return null;
        }
    },
    Identificator: {
        type: 'Identificator',
    },
    Array: (Type) => {
        return {
            type: 'Array',
            arrayOfType: Type,
            check(value) {
                return Array.isArray(value) && (value.length === 0 || this.arrayOfType.check(value[0]));
            },
            default() {
                return [];
            }
        }
    },
    Reference: (Model) => {
        return {
            type: 'Reference',
            model: Model,
            default() {
                return null;
            },
            check(value) {
                const isNumber = (v) => typeof (v) === 'number' || v instanceof Number
                return isNumber(value) || !value || isNumber(value.id)
            }
        }
    }
}