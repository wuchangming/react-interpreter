import { ReactInterpreter } from 'react-interpreter'
import Taro from '@tarojs/taro'
import * as taroComps from '@tarojs/components'
import { Component } from 'react'
import './index.less'

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

class Index extends Component {
    render() {
        return (
            <ReactInterpreter
                globalObject={{
                    Taro,
                }}
                componentMap={taroComps}
                code={codeString}
            ></ReactInterpreter>
        )
    }
}

export default Index
