/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("body-parser");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const mongoose_1 = tslib_1.__importDefault(__webpack_require__(6));
const User = mongoose_1.default.model('User', new mongoose_1.default.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
}));
exports["default"] = User;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const body_parser_1 = tslib_1.__importDefault(__webpack_require__(3));
const cookie_parser_1 = tslib_1.__importDefault(__webpack_require__(4));
const cors_1 = tslib_1.__importDefault(__webpack_require__(5));
const mongoose_1 = tslib_1.__importDefault(__webpack_require__(6));
const bcrypt_1 = tslib_1.__importDefault(__webpack_require__(7));
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(8));
const User_1 = tslib_1.__importDefault(__webpack_require__(9));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200',
    credentials: true
}));
// const uri = "mongodb+srv://admin:admin1234@cluster0.byt74xc.mongodb.net/?retryWrites=true&w=majority";
//app.use('/assets', express.static(path.join(__dirname, 'assets')));
const MONGO_URI = "mongodb+srv://admin:admin1234@cluster0.byt74xc.mongodb.net/?retryWrites=true&w=majority";
mongoose_1.default.connect(MONGO_URI, {});
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "connection error: "));
app.get('/api/test', (req, res) => {
    res.send({ message: 'Welcome to server!' });
});
const secret = "SECRET_1234";
app.post('/api/register', (req, res) => {
    const { email, firstName, lastName } = req.body;
    console.log(req.body);
    const password = bcrypt_1.default.hashSync(req.body.password, 10);
    const user = new User_1.default({ email, firstName, lastName, password });
    user.save().then((user) => {
        jsonwebtoken_1.default.sign({ id: user._id }, secret, (err, token) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }
            else {
                res.status(201).cookie('token', token).send();
            }
        });
    }).catch(e => {
        console.log(e);
        res.sendStatus(500);
    });
});
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map