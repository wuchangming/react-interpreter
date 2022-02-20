import { useEffect, useRef, useState } from 'react'
import Interpreter from '../js-interpreter/interpreter'
import { transformComponent, CompObj } from './transformComponent'
import { SendMessageKey, FuncPrefix, ReactFragmentFlag, CompPropsName } from './constants'
import { createAsyncSwitcher } from './createAsyncSwitcher'
import { injectGlobalObject } from './injectGlobalObject'

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
    code?: string
    /**
     * 需要注入的全局变量
     */
    globalObject?: { [key in string]: any }
    /**
     * 设置被注入的全局变量的复杂属性最大层级。
     *
     * 为了保证转化效率，大于该层级的任何不能 JSON.stringify 的内容都会
     * 被丢弃掉「如 function 和出现循环引用的 object 等」。
     *
     * 默认值：3
     */
    globalObjectComplexPropLevel?: number
    /**
     * 需要注入的 React 组件
     */
    componentMap?: { [key in string]: any }
}

export function ReactInterpreter<T>(props: T & ReactInterpreterProps) {
    const { code, globalObject: inputGlobalObject, globalObjectComplexPropLevel, componentMap, ...restProps } = props

    const [components, setComponents] = useState<CompObj>()

    const s = useRef<(msg: OutsideMsg) => void>()

    useEffect(() => {
        if (!props.code) {
            return
        }
        const compCode = props.code
            .trim()
            .replace(/^\"use strict\";/, '')
            .replace(/^\'use strict\';/, '')

        const exeCode = `
        (function () {
            ${Object.keys(componentMap || {})
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
                    Fragment: { type: "${ReactFragmentFlag}" },
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
                var comps = (${compCode})(${CompPropsName});
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
            injectGlobalObject(
                interpreter,
                globalObject,
                { ...inputGlobalObject, [CompPropsName]: restProps },
                globalObjectComplexPropLevel
            )
        })
        compInterpreter.run()
    }, [props])

    return components
        ? transformComponent(componentMap || {}, components, (funcId, args) => {
              s.current?.({
                  type: 'exeFunc',
                  funcId,
                  args: [...args],
              })
          })
        : null
}
