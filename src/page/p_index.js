import { node } from "../core/node.js"
import { router } from "../core/router.js"

export const p_index = () => {

    // custom css class
    const btnClass = 'bg-cyan-500 inline-flex p-2 cursor-pointer hover:bg-black'

    // UI DOM Build
    let jsdom = node.div().setClass('text-white bg-black').setChildren([
        node.div('navBar').setClass('flex justify-between p-3').setChildren([
            node.div('title').setChildren([
                node.span().setClass('text-3xl font-bold underline').setText('chill.js'),
                node.span().setClass('text-[yellowgreen]').setText(' v0.1'),
            ]),
            node.div().setClass('p-1 bg-[#555]').setChildren(
                router.group('routerViewIndex', [
                    node.button('', 'Home', btnClass, 'index/home'),
                    node.button('', 'Intro', btnClass, 'index/intro')
                ])
            ),
        ]),
        node.div('routerViewIndex').setClass('clear-both')
    ])

    // UI Interaction
    jsdom.getChildById('title').on('click', _ => router.go('index/home'))

    return jsdom
}