# react-interpreter

React 沙盒，可理解为 React 版的 `eval()` 。该沙盒运行机制可使基于 React 实现的小程序框架「如 Taro3 等」拥有 🚀 **热更新**能力。

<a href="https://unpkg.com/react-interpreter/dist/react-interpreter.min.js"><img src="https://img.badgesize.io/https://unpkg.com/react-interpreter/dist/react-interpreter.min.js?compression=gzip&style=flat-square" alt="Gzip Size"></a>
<a href="https://www.npmjs.com/package/react-interpreter"><img src="https://img.shields.io/npm/v/react-interpreter.svg?style=flat-square&colorB=51C838" alt="NPM Version"></a>

## 安装

```
npm install react-interpreter --save
```

或者

```
yarn add react-interpreter --save
```

## API

### `ReactInterpreter` - React 沙盒组件

-   ### **Props**

    -   `code`  
        React 沙盒运行的代码字符串 [PS: ⚠️React 沙盒组件运行的字符串代码只支持 es5，也不支持 jsx。可以先通过 [babel 进行转换](https://babeljs.io/repl/#?browsers=defaults&build=&builtIns=false&corejs=3.6&spec=false&loose=false&code_lz=Q&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=true&targets=&version=7.17.2&externalPlugins=&assumptions=%7B%7D)]

    -   `globalObject`  
        需要注入沙盒中的全局变量

        ```ts
        globalObject = {
            wx,
            console
        }
        ```

    -   `componentMap`  
        需要注入沙盒中的 React 组件

        ```ts
        import { View } from '@tarojs/components'
        componentMap={
            View
        }
        ```

    -   `globalObjectComplexPropLevel`  
        设置被注入的全局变量的复杂属性最大层级。为了保证转化效率，大于该层级的任何不能 JSON.stringify 的内容都会被丢弃掉「如 function 和出现循环引用的 object 等」。`默认值：3`

-   ### 实例

    -   ### Taro3 中用法示例 [查看 Demo 项目](./demos/taro-demo/)

        ```tsx
        import { ReactInterpreter } from 'react-interpreter'
        import Taro from '@tarojs/taro'
        import * as taroComponents from '@tarojs/components'

        /*
            Babel 转换前代码如下：

            // 注意：这个组件名命名只要不和注入的组件重名就行，没有特别要求
            function MyReactInterpreterComp() {
                return (
                    <View
                        style={{
                            backgroundColor: 'pink',
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Button
                            style={{ backgroundColor: 'blue', color: '#FFFFFF' }}
                            onClick={() => {
                                Taro.showToast({
                                    icon: 'none',
                                    title: '😂😂😂',
                                })
                            }}
                        >
                            Click Me!
                        </Button>
                    </View>
                )
            }
        */

        // Babel 转换后
        const codeString = `
        function MyReactInterpreterComp() {
        return /*#__PURE__*/ React.createElement(
            View,
            {
            style: {
                backgroundColor: "pink",
                height: "100vh",
                display: "flex",
                alignItems: "center"
            }
            },
            /*#__PURE__*/ React.createElement(
            Button,
            {
                style: {
                backgroundColor: "blue",
                color: "#FFFFFF"
                },
                onClick: function onClick() {
                Taro.showToast({
                    icon: "none",
                    title: "😂😂😂"
                });
                }
            },
            "Click Me!"
            )
        );
        }
        `

        const MyComponent = () => {
            return (
                <ReactInterpreter
                    // globalObject: 可设置沙盒内全局变量
                    // 把 Taro 对象注入到沙盒中，有需要也可以把 wx 对象注入
                    globalObject={{
                        Taro,
                    }}
                    // componentMap: 接收真实的组件定义
                    // 这里注入全部 @tarojs/components，可以根据实际情况选择部分注入
                    componentMap={taroComponents}
                    // code: 需要运行的组件代码
                    // 只支持 es5，如果代码包含 jsx 和 es6，可先通过 babel 进行转换
                    code={codeString}
                />
            )
        }

        ```

        Taro3 中用法示例效果图

        <image src='./docs/imgs/demo.jpeg' width = '200'/>

### `JSInterpreter` - JS 沙盒

```ts
import { JSInterpreter } from 'react-interpreter'
```

参考 JS-Interpreter 文档： [https://neil.fraser.name/software/JS-Interpreter/docs.html](https://neil.fraser.name/software/JS-Interpreter/docs.html)

## 灵感来源

-   [JS-Interpreter](https://github.com/NeilFraser/JS-Interpreter)
-   [jsjs](https://github.com/bramblex/jsjs)
