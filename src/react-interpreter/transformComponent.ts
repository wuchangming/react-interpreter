import React from 'react'
import { FuncPrefix } from './constants'

type SupportType = {
    type: string
}

export type CompObj = [SupportType | string, object | null, CompObj[]]

export function transformComponent(
    polyfillComponents: { [key in string]: any },
    compObj: CompObj,
    invokeInside: (id: string, args: IArguments) => void
) {
    if (compObj === null || typeof compObj === 'string') {
        return compObj
    }

    const typeOrString = compObj[0]

    if (typeof typeOrString === 'string') {
        return compObj[0]
    }

    const props = compObj[1]
    const children = compObj[2]

    for (let k in props) {
        if (new RegExp(`^${FuncPrefix}`).test(props[k])) {
            const id = props[k]
            props[k] = function () {
                invokeInside(id, arguments)
            }
        }
    }

    const Comp: React.ComponentType = polyfillComponents[(typeOrString as SupportType).type]

    if (Comp === undefined) {
        throw '不支持当前 Component 类型: ' + typeOrString
    }

    if (typeof children === 'string' || children === null) {
        return React.createElement(Comp, props, children)
    } else if (Array.isArray(children)) {
        const childrenElement = children.map((subCom: CompObj) => {
            return transformComponent(polyfillComponents, subCom, invokeInside)
        })
        return React.createElement(Comp, props, ...childrenElement)
    }
}
