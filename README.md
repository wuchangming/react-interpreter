# react-interpreter
**⚠️⚠️⚠️ 该方案不再维护，改为 [mini-hot](https://github.com/mini-hot/mini-hot) 中维护**

React 沙盒 📦，可理解为 React 版的 `eval()` 。该沙盒运行机制可使基于 React 实现的小程序框架「如 Taro3 等」拥有 🚀 **热更新**能力。

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

---

-   ### **Props**

    -   #### `code` -- React 沙盒运行的代码字符串

        ⚠️ `PS: React 沙盒组件运行的字符串代码需使用 es5 编写的函数组件，不支持 hooks、class 组件。不直接支持 jsx 写法，可以先通过` [**babel 进行转换**](https://babeljs.io/repl/#?browsers=defaults&build=&builtIns=false&corejs=3.6&spec=false&loose=false&code_lz=Q&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=true&targets=&version=7.17.2&externalPlugins=&assumptions=%7B%7D)

        ```ts
        import { ReactInterpreter } from 'react-interpreter'
        import { View, Text } from '@tarojs/components'
        /*
        【Babel 编译前组件代码】
        */
        /*
        注意：这个组件名命名只要不和注入的组件重名就行，没有特别要求
        function MyComp() {
            return (
                <View
                    style={{
                        backgroundColor: '#00C28E',
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text>Hello World !</Text>
                </View>
            )
        }
        */
        /*
        【Babel 编译后组件代码 string】
        */
        const codeString = `function MyComp() {
            return React.createElement(
                View,
                {
                    style: {
                        backgroundColor: '#00C28E',
                        height: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                },
                React.createElement(Text, null, 'Hello World !')
            )
        }`
        const MyComp = () => (
            <ReactInterpreter
                code={codeString}
                componentMap={{
                    View,
                    Text,
                }}
            ></ReactInterpreter>
        )
        ```

        -   效果图

            <image src='./docs/imgs/code-demo.jpeg' width = '200'/>

    -   #### `globalObject` -- 需要注入沙盒中的全局变量

        ```ts
        globalObject = {
            wx, // 注入 wx 全局变量
            console, // 注入 console 控制台
        }
        ```

    -   #### `componentMap` -- 需要注入沙盒中的 React 组件

        ```ts
        import { View } from '@tarojs/components'
        componentMap = {
            View,
        }
        ```

    -   #### `globalObjectComplexPropLevel` -- 全局变量复杂属性最大层级

        `默认值：3`

        `设置被注入的全局变量的复杂属性最大层级。为了保证转化效率，大于该层级的任何不能 JSON.stringify 的内容都会被丢弃掉「如 function 和出现循环引用的 object 等」。`

    -   #### `沙盒组件 props 传值方式`

        `除了 ReactInterpreter API 外的其他 props 都会被直接透传到沙盒内的组件`

        ```ts
        const codeString = `
        function MyComp(props) {
            return /*#__PURE__*/ React.createElement(
                Button,
                {
                onClick: props.onClickMe
                },
                "I am a button -- ",
                props.btnName
            );
        }
        `

        const MyComp = () => (
            <ReactInterpreter
                code={codeString}
                componentMap={{
                    Button,
                }}
                // btnName, onClickMe 会被透传到沙盒中的组件
                btnName={'我是个按钮🔘'}
                onClickMe={() => {
                    console.log('我被点击了！')
                }}
            ></ReactInterpreter>
        )
        ```

### `JSInterpreter` - JS 沙盒

---

如果只需要执行 JS ，可直接使用 JSInterpreter

-   ### 基本用法

    ```ts
    import { JSInterpreter } from 'react-interpreter'

    const myInterpreter = new JSInterpreter('6 * 7')
    myInterpreter.run()
    console.log(myInterpreter.value)
    ```

    JSInterpreter 代码基本都是使用的 [JS-Interpreter](https://github.com/NeilFraser/JS-Interpreter) 项目，只做了对微信小程序相关 bug 的修复，所以详细文档可直接参考 JS-Interpreter 文档： [https://neil.fraser.name/software/JS-Interpreter/docs.html](https://neil.fraser.name/software/JS-Interpreter/docs.html)

## 实例 Demo

-   ### Taro3 中用法示例 [查看 Demo 项目](./demos/taro-demo/)

## 灵感来源

-   [JS-Interpreter](https://github.com/NeilFraser/JS-Interpreter)
-   [jsjs](https://github.com/bramblex/jsjs)
