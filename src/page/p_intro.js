import { node } from "../core/node.js"
import { router } from "../core/router.js"

export const p_intro = () => {

    // custom css class
    const btnClass = 'inline-flex p-2 cursor-pointer hover:bg-[#333]'

    // UI DOM Build
    let jsdom = node.div('hi').setChildren([
        node.div().setClass('p-1 bg-[#FFFFFF22] flex justify-center').setChildren(
            router.group('routerViewIntro', [
                node.button('', 'MVVM', btnClass, 'index/intro/pageA').setStyle({ marginRight: '1px' }),
                node.button('', 'Misc.', btnClass, 'index/intro/pageB')
            ])
        ),
        node.div('routerViewIntro')
    ])

    // UI Interaction
    // ...

    return jsdom
}
