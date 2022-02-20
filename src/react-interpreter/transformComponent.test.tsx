import React from 'react'
import { ReactFragmentFlag } from './constants'
import { transformComponent } from './transformComponent'

test('transformComponent', () => {
    const View = (props: { x: number; children?: any }) => (
        <div>
            View {props.x}
            {props.children}
        </div>
    )
    const Button = (props: { i: string }) => <div>Button {props.i}</div>

    function invokeInside() {}

    // null
    expect(transformComponent({}, null, invokeInside)).toBe(null)

    // []
    expect(transformComponent({}, [], invokeInside)).toEqual([])

    // React.Fragment
    expect(
        transformComponent(
            {},
            [
                {
                    type: ReactFragmentFlag,
                },
                null,
            ],
            invokeInside
        )
    ).toEqual(React.createElement(React.Fragment))

    // <></>
    expect(
        transformComponent(
            {},
            [
                {
                    type: ReactFragmentFlag,
                },
                null,
            ],
            invokeInside
        )
    ).toEqual(<></>)

    // <View x={1} />
    expect(
        transformComponent(
            {
                View,
            },
            [
                {
                    type: 'View',
                },
                { x: 1 },
            ],
            invokeInside
        )
    ).toEqual(<View x={1} />)

    // <><View x={1} /></>
    expect(
        transformComponent(
            {
                View,
            },
            [
                {
                    type: ReactFragmentFlag,
                },
                null,
                [[{ type: 'View' }, { x: 1 }]],
            ],
            invokeInside
        )
    ).toEqual(
        <>
            <View x={1} />
        </>
    )

    //     <View x={2}>
    //         <Button i='a' />
    //         <Button i='b' />
    //     </View>
    expect(
        transformComponent(
            {
                View,
                Button,
            },
            [
                {
                    type: 'View',
                },
                { x: 2 },
                [
                    [{ type: 'Button' }, { i: 'a' }],
                    [{ type: 'Button' }, { i: 'b' }],
                ],
            ],
            invokeInside
        )
    ).toEqual(
        <View x={2}>
            <Button i='a' />
            <Button i='b' />
        </View>
    )

    /**
     * [<Button i='a' />, <Button i='b' />]
     */
    expect(
        transformComponent(
            {
                View,
                Button,
            },
            [
                [
                    {
                        type: 'Button',
                    },
                    { i: 'a' },
                ],
                [
                    {
                        type: 'Button',
                    },
                    { i: 'b' },
                ],
            ],
            invokeInside
        )
    ).toEqual([<Button i='a' />, <Button i='b' />])

    /**
     * ['123123', <Button i='b' />]
     */
    expect(
        transformComponent(
            {
                View,
                Button,
            },
            [
                '123123',
                [
                    {
                        type: 'Button',
                    },
                    { i: 'b' },
                ],
            ],
            invokeInside
        )
    ).toEqual(['123123', <Button i='b' />])

    // [
    //     '123123',
    //     <View x={1}>
    //         <Button i='a'></Button>
    //     </View>,
    // ]
    expect(
        transformComponent(
            {
                View,
                Button,
            },
            [
                '123123',
                [
                    {
                        type: 'View',
                    },
                    { x: 1 },
                    [[{ type: 'Button' }, { i: 'a' }]],
                ],
            ],
            invokeInside
        )
    ).toEqual([
        '123123',
        <View x={1}>
            <Button i='a'></Button>
        </View>,
    ])

    // [
    //     '123123',
    //     <View x={1}>abc</View>,
    // ]
    expect(
        transformComponent(
            {
                View,
                Button,
            },
            [
                '123123',
                [
                    {
                        type: 'View',
                    },
                    { x: 1 },
                    ['abc'],
                ],
            ],
            invokeInside
        )
    ).toEqual([
        '123123',
        <View x={1}>abc</View>,
    ])
})
