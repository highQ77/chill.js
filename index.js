import { node } from "./src/core/node.js";
import { router } from "./src/core/router.js";
import { store } from "./src/core/store.js";

// store init
store.init()

// router init
router.init()

// app entry - root node
node.div('app')