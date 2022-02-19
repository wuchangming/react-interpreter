import React from 'react'
import { FuncPrefix, ReactFragmentFlag } from './constants'

type SupportType = {
    type: string
}

export type CompObj = [SupportType | string, object | null, CompObj[]?] | []

export function transformComponent(
    polyfillComponents: { [key in string]: any },
    compObj: CompObj,
    invokeInside: (id: string, args: IArguments) => void
) {
    if (compObj === null || typeof compObj === 'string' || compObj.length === 0) {
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

    const type = (typeOrString as SupportType)?.type

    let Comp: React.ComponentType = polyfillComponents[type]

    if (type === ReactFragmentFlag) {
        Comp = React.Fragment
    }

    if (typeof children === 'string' || children === null || children === undefined) {
        return React.createElement(Comp, props, children)
    } else if (Array.isArray(children)) {
        const childrenElement = children.map((subCom: CompObj) => {
            return transformComponent(polyfillComponents, subCom, invokeInside)
        })
        return React.createElement(Comp, props, ...childrenElement)
    }
}
