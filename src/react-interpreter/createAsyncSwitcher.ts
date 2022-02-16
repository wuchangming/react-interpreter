/**
 * 异步开关
 */
export function createAsyncSwitcher<T>(): [Promise<T>, (t: T) => any] {
    let turnOn: (t: T) => any = () => {}
    const switcher = new Promise((done: (t: T) => void) => {
        turnOn = (t: T) => {
            done(t)
        }
    })
    return [switcher, turnOn]
}
