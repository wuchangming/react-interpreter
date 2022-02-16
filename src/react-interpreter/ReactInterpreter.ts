import { useEffect, useRef, useState } from 'react'
import Interpreter from '../js-interpreter/interpreter'
import { transformComponent, CompObj } from './transformComponent'
import { SendMessageKey, FuncPrefix } from './constants'
import { createAsyncSwitcher } from './createAsyncSwitcher'

type InsideMessage =
    | {
          type: 'render'
          comps: CompObj
      }
    | {
          type: 'waiting'
      }

type OutsideMsg = {
    type: 'exeFunc'
    funcId: string
    args: any[]
}

type ReactInterpreterProps = {
    /**
     * React沙盒运行的代码字符串
     */
    ri_code?: string
    /**
     * 需要注入的全局变量
     */
    ri_globalObjectMap?: { [key in string]: object }
    /**
     * 需要注入的 React 组件
     */
    ri_componentMap?: { [key in string]: any }
}

export function ReactInterpreter<T>(props: T & ReactInterpreterProps) {
    const { ri_code, ri_globalObjectMap, ri_componentMap, ...restProps } = props

    const [components, setComponents] = useState<CompObj>()

    const s = useRef<(msg: OutsideMsg) => void>()

    useEffect(() => {
        if (!props.ri_code) {
            return
        }
        const compCode = props.ri_code
            .trim()
            .replace(/^\"use strict\";/, '')
            .replace(/^\'use strict\';/, '')

        const exeCode = `
        (function () {
            ${Object.keys(ri_componentMap || {})
                .map((k) => {
                    return `var ${k} = {
                    type: "${k}"
                };`
                })
                .join('')}
                function sendMsg (msg) {
                    return ${SendMessageKey}(JSON.stringify(msg));
                }
                var React = {
                    createElement: function(component, props) {
                        for(var k in props) {
                            if(typeof props[k] === 'function') {
                                var mapKey = "${FuncPrefix}" + id++
                                funcsMap[mapKey] = props[k]
                                props[k] = mapKey
                            }
                        }
                        return [
                            component,
                            props,
                            arguments.slice(2)
                        ]
                    }
                };
                var id = 0;
                var funcsMap = {};
                var comps = (${compCode})(${JSON.stringify(restProps)});
                sendMsg({
                    type: 'render',
                    comps: comps
                });

                if(Object.keys(funcsMap).length > 0) {
                    while (true){
                        var outsideMsg = sendMsg({
                            type: 'waiting'
                        });
                        var msg = JSON.parse(outsideMsg)
                        if(msg.type === 'exeFunc') {
                            funcsMap[msg.funcId].apply(null, msg.args)
                        }
                    }
                }
        })();`

        const compInterpreter = new Interpreter(exeCode, (interpreter: Interpreter, globalObject: any) => {
            // 注入通信方法
            interpreter.setProperty(
                globalObject,
                SendMessageKey,
                interpreter.createAsyncFunction(
                    async (msgString: string, callback: (outsideMsgString?: string) => void) => {
                        const msg = JSON.parse(msgString) as InsideMessage
                        if (msg.type === 'render') {
                            setComponents(msg.comps)
                            callback()
                        } else if (msg.type === 'waiting') {
                            const [switcher, turnOn] = createAsyncSwitcher<OutsideMsg>()
                            s.current = turnOn
                            const msg = await switcher
                            callback(JSON.stringify(msg))
                        }
                    }
                )
            )
            // 注入全局变量
            Object.keys(ri_globalObjectMap || {}).forEach((k) => {
                const pseudoObj = interpreter.createObjectProto(interpreter.OBJECT_PROTO)
                interpreter.setProperty(globalObject, k, pseudoObj, Interpreter.READONLY_DESCRIPTOR)
                const kObj = ri_globalObjectMap?.[k] || {}
                Object.keys(kObj).forEach((pk) => {
                    if (typeof kObj[pk] === 'function') {
                        interpreter.setProperty(
                            pseudoObj,
                            pk,
                            interpreter.createNativeFunction(function (params) {
                                if (typeof params === 'object') {
                                    kObj[pk](params.properties)
                                } else {
                                    kObj[pk](params)
                                }
                            }, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR
                        )
                    }
                })
            })
        })
        compInterpreter.run()
    }, [props])

    return components
        ? transformComponent(ri_componentMap || {}, components, (funcId, args) => {
              s.current?.({
                  type: 'exeFunc',
                  funcId,
                  args: [...args],
              })
          })
        : null
}
