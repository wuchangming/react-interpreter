import { createAsyncSwitcher } from './createAsyncSwitcher'

test('createAsyncSwitcher', async () => {
    const resString = 'success'
    const [switcher, turnOn] = createAsyncSwitcher<string>()
    setTimeout(() => {
        turnOn(resString)
    })
    const res = await switcher
    expect(res).toEqual(resString)
})
