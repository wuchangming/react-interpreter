import React from 'react'
import { FuncPrefix, ReactFragmentFlag } from './constants'

type SupportType = {
    type: string
}

type CompInnerObjArr = CompInnerObj[]

type CompInnerObj = [SupportType | string, object | null, CompInnerObj[]?] | []

export type CompObj = CompInnerObjArr | CompInnerObj

function isCompArr(compObj: any = []) {
    if (typeof compObj[0]?.type === 'string') {
        return false
    } else if (Array.isArray(compObj)) {
        return true
    }
    return false
}

export function transformComponent(
    polyfillComponents: { [key in string]: any },
    compObj: CompObj,
    invokeInside: (id: string, args: IArguments) => void
) {
    if (Array.isArray(compObj)) {
        if (compObj.length === 0) {
            return compObj
        }
        if (isCompArr(compObj)) {
            return compObj.map((comp) => {
                return transformComponent(polyfillComponents, comp, invokeInside)
            })
        } else {
            const typeOrString = compObj[0]

            if (typeof typeOrString === 'string') {
                return compObj[0]
            }

            const props = compObj[1] as object
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
    } else {
        return compObj
    }
}
