import { node } from "../core/node.js"
import { router } from "../core/router.js"

export const p_intro = () => {

    // custom css class
    const btnClass = 'bg-orange-500 inline-flex p-2 cursor-pointer hover:bg-black'

    // UI DOM Build
    let jsdom = node.div('hi').setChildren([
        node.div().setClass('p-1 bg-[#555]').setChildren(
            router.group('routerViewIntro', [
                node.button('', 'Intro A', btnClass, 'index/intro/pageA').setStyle({ marginRight: '1px' }),
                node.button('', 'Intro B', btnClass, 'index/intro/pageB')
            ])
        ),
        node.div('routerViewIntro')
    ])

    // UI Interaction
    // ...

    return jsdom
}
