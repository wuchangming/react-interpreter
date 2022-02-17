import Interpreter from '../js-interpreter/interpreter'

// https://stackoverflow.com/questions/11616630/how-can-i-print-a-circular-structure-in-a-json-like-format
// safely handles circular references
const safeStringify = (obj: object, indent = 2) => {
    let cache = []
    const retVal = JSON.stringify(
        obj,
        (key, value) =>
            typeof value === 'object' && value !== null
                ? cache.includes(value)
                    ? undefined // Duplicate reference found, discard key
                    : cache.push(value) && value // Store value in our collection
                : value,
        indent
    )
    cache = null
    return retVal
}

export function injectGlobalObject(interpreter: Interpreter, parentObject: any, input: any, maxLevel = 3) {
    const kObj = input || {}
    Object.keys(kObj).forEach((pk) => {
        if (typeof kObj[pk] === 'function') {
            interpreter.setProperty(
                parentObject,
                pk,
                interpreter.createNativeFunction(function (params) {
                    if (typeof params === 'object') {
                        kObj[pk](params.properties)
                    } else {
                        kObj[pk](params)
                    }
                }, false),
                Interpreter.READONLY_DESCRIPTOR
            )
        } else if (typeof kObj[pk] === 'object') {
            const pseudoObj = interpreter.createObjectProto(interpreter.OBJECT_PROTO)
            interpreter.setProperty(parentObject, pk, pseudoObj, Interpreter.READONLY_DESCRIPTOR)
            if (maxLevel > 0) {
                injectGlobalObject(interpreter, pseudoObj, kObj[pk], --maxLevel)
            } else {
                const o = JSON.parse(safeStringify(kObj[pk]))
                injectGlobalObject(interpreter, pseudoObj, o, Infinity)
            }
        } else if (['string', 'number', 'boolean', 'null', 'undefined'].indexOf(typeof kObj[pk]) > -1) {
            interpreter.setProperty(parentObject, pk, kObj[pk], Interpreter.READONLY_DESCRIPTOR)
        } else {
            // 其他类型不支持
            interpreter.setProperty(parentObject, pk, undefined, Interpreter.READONLY_DESCRIPTOR)
        }
    })
}
