import { node } from "../core/node.js"

let globalColor = 'slate-800'

// ---------------- Button
const buttonClass = `bg-${globalColor} inline-flex p-2 cursor-pointer hover:bg-[#FFFFFF22] border-1 border-[transparent] hover:border-b-[springgreen] m-1 rounded-sm select-none`
function button(tid, label, pageId, activeClassName = 'active') {
    return node.button(tid, label, buttonClass, pageId, activeClassName)
}

// ---------------- SelectFileButton
const fileButtonClass = `bg-yellow-500 inline-flex p-2 cursor-pointer hover:bg-black m-1 rounded-sm select-none`
function file(id, label, readerMode, callback) {
    return node.file(id, label, fileButtonClass, readerMode, callback)
}

// ---------------- Alert & Confirm
const dialogTitleClass = `bg-${globalColor} text-[white] flex justify-center items-center h-[43px] select-none`
const dialogBodyClass = `bg-[white] rounded-sm overflow-hidden border-3 border-${globalColor} outline-5 shadow-lg`
const dialogBottonGroupClass = `text-right`
const dialogButtonClass = `bg-${globalColor} inline-flex p-2 cursor-pointer hover:bg-black m-1 rounded-sm min-w-[50px] text-[white] justify-center items-center select-none`

const essentialDialogStyle = {
    /** dialog title */
    dialogTitleClass,
    /** dialog body container */
    dialogBodyClass,
    /** dialog bottom buttons' container */
    dialogBottonGroupClass,
    /** dialog bottom buttons' class  */
    dialogButtonClass,
}

function alert(msg, cssWidth, cssHeight, callback) {
    return node.alert(msg, essentialDialogStyle, cssWidth, cssHeight, callback)
}

function confirm(msg, cssWidth, cssHeight, callback) {
    return node.confirm(msg, essentialDialogStyle, cssWidth, cssHeight, callback)
}

// ---------------- Date & Time Picker

const dateClass = {
    /**  selected digital date button border */
    dateDigiBottonNone: `border-1 hover:border-[#999]`,
    dateDigiBotton: `border-1 hover:border-${globalColor}`,
}

function date(callback) {
    return node.date(essentialDialogStyle, dateClass, '325px', '285px', callback)
}

function time(callback) {
    return node.time(essentialDialogStyle, '325px', '285px', callback)
}

// ---------------- Color Picker

const colorClass = {}

function color(callback) {
    return node.color(essentialDialogStyle, colorClass, '295px', '288px', callback)
}

// ---------------- Selection
function vm_select(id, title, vmView, vmModel, clickCallback) {
    return node.vm_select(id, title, vmView, vmModel, '300px', 250, '#333', '#555', '#333', 'springgreen', clickCallback).setClass(`select-none`)
}

// ---------------- Layout
const layoutV = (node, gapVal = 0) => {
    return node.setClass(`grid gap-${gapVal}`)
}

const layoutH = (node, colsCount = 1, gapVal = 0) => {
    return node.setClass(`grid grid-cols-${colsCount} gap-${gapVal}`)
}

export const ui = {
    button,
    file,
    alert,
    confirm,
    date,
    time,
    color,
    vm_select,
    layoutV,
    layoutH,
}