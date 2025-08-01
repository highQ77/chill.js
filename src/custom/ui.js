import { node } from "../core/node.js"

const essentialDialogStyle = [
    'bg-cyan-500 text-[white] flex justify-center items-center h-[43px]',
    'bg-[white] rounded-sm overflow-hidden',
    'text-right',
    'bg-cyan-500 inline-flex p-2 cursor-pointer hover:bg-black m-1 rounded-sm w-[100px] text-[white] justify-center items-center ',
    '350px',
    '200px',
]

function alert(msg, callback) {
    return node.alert(msg, ...essentialDialogStyle, callback)
}

function confirm(msg, callback) {
    return node.confirm(msg, ...essentialDialogStyle, callback)
}

export const ui = {
    /** custom ui style - alert */
    alert,
    /** custom ui style - confirm */
    confirm
}