import { node } from "../core/node.js"
import { router } from "../core/router.js"
import { store } from "../core/store.js"

export const p_index = () => {

    // custom css class
    const btnClass = 'inline-flex p-2 cursor-pointer hover:bg-[#333]'

    // UI DOM Build
    let jsdom = node.div().setClass('text-white bg-black').setChildren([
        // topbar
        node.div('navBar').setClass('flex justify-between items-center p-1').setChildren([
            node.div('title').setClass('cursor-pointer').setChildren([
                node.span().setClass('text-3xl font-bold underline').setText('chill.js'),
                node.span().setClass('text-[springgreen]').setText(' v0.1'),
            ]),
            node.div().setClass('mr-[10px]').setChildren(
                router.group('routerViewIndex', [
                    node.button('', 'Home', btnClass, 'index/home').setStyle({ marginRight: '1px' }),
                    node.button('', 'Intro', btnClass, 'index/intro')
                ])
            ),
        ]),
        node.div('').setClass('clear-both h-[3px] bg-[#333]'),
        // content
        node.div('routerViewIndex'), // id == routerViewIndex match with router.group('routerViewIndex', [...]) 
        // footer
        node.div('div').setClass('h-[50px] bg-black flex justify-center items-center').setChildren([
            node.span().setText('powered by william77').setClass('text-[#666]')
        ])
    ])

    // UI Interaction
    jsdom.getChildById('title').on('click', _ => router.go('index/home'))

    // full page custom scroll bar
    return node.scroller('', '100vw', '100dvh', 'springgreen', '#333', '0px', '0px', jsdom)
}