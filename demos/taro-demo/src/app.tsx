import { Component } from 'react'
import './app.less'

class App extends Component {
    componentDidMount() {}

    componentDidShow() {}

    componentDidHide() {}

    componentDidCatchError() {}

    // this.props.children 就是要渲染的页面
    render() {
        return this.props.children
    }
}

export default App
