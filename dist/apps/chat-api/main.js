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

module.exports = require("http");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const mongoose_1 = tslib_1.__importStar(__webpack_require__(6));
// Define the schema for users
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});
// Create the User model
const User = mongoose_1.default.model('User', userSchema);
exports["default"] = User;


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const mongoose_1 = tslib_1.__importStar(__webpack_require__(6));
const messageSchema = new mongoose_1.Schema({
    senderInfo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    timestamp: { type: Date, default: Date.now },
    chatRoomId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ChatRoom' }, // Reference to the ChatRoom document
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports["default"] = Message;


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const mongoose_1 = tslib_1.__importDefault(__webpack_require__(6));
const ChatRooms_1 = tslib_1.__importDefault(__webpack_require__(14));
const Message_1 = tslib_1.__importDefault(__webpack_require__(12));
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(10));
const router = express_1.default.Router();
// Create a new chat room
router.post('/chatrooms', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, users } = req.body;
        const newRoom = new ChatRooms_1.default({ name, description, users });
        yield newRoom.save();
        res.status(201).json(newRoom);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating chat room' });
    }
}));
// Get all chat rooms
router.get('/chatrooms', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const chatRooms = yield ChatRooms_1.default.find().populate('users').exec();
        res.json(chatRooms);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching chat rooms' });
    }
}));
const secret = "SECRET_1234";
router.post('/join/:roomId', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Verify the user's token and get user information
        const userInfo = jsonwebtoken_1.default.verify(token, secret);
        // Find the chat room by ID
        const chatRoom = yield ChatRooms_1.default.findById(roomId);
        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }
        // Check if the user is already a participant in the chat room
        const userId = userInfo.id.toString();
        const userIsParticipant = chatRoom.users.some((user) => user.toString() === userId);
        if (userIsParticipant) {
            return res.status(400).json({ error: 'User is already in the chat room' });
        }
        const userIdObject = new mongoose_1.default.Types.ObjectId(userId);
        // Add the user's ID to the chat room's participants list
        chatRoom.users.push(userIdObject);
        // Save the updated chat room
        yield chatRoom.save();
        // Optionally, you can send back the updated chat room data to the client
        res.status(200).json({ message: 'Successfully joined the chat room', chatRoom });
    }
    catch (error) {
        console.error('Error joining chat room:', error);
        res.status(500).json({ error: 'Failed to join the chat room' });
    }
}));
// Get a specific chat room by ID
router.get('/chatrooms/:id', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.id;
        const chatRoom = yield ChatRooms_1.default.findById(roomId);
        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }
        res.json(chatRoom);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching chat room' });
    }
}));
// Get chat messages for a specific chat room
router.get('/chatroom/:roomId/messages', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    try {
        // Use MongoDB aggregation to join messages with user names
        const messages = yield Message_1.default.aggregate([
            {
                $match: { chatRoomId: new mongoose_1.default.Types.ObjectId(roomId) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'senderInfo',
                    foreignField: '_id',
                    as: 'senderInfo'
                }
            },
            {
                $unwind: '$senderInfo'
            },
            {
                $project: {
                    text: 1,
                    timestamp: 1,
                    'senderInfo.firstName': 1,
                    'senderInfo.lastName': 1,
                    'senderInfo._id': 1
                }
            }
        ]);
        // Optionally, you can also fetch the chat room name
        const chatRoom = yield ChatRooms_1.default.findById(roomId, 'name');
        res.json({
            chatRoomName: chatRoom.name,
            messages
        });
    }
    catch (error) {
        console.error('Error fetching chat room messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat room messages' });
    }
}));
// Update a chat room by ID
router.put('/chatrooms/:id', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.id;
        const { name, description, users } = req.body;
        const updatedRoom = yield ChatRooms_1.default.findByIdAndUpdate(roomId, { name, description, users }, { new: true });
        if (!updatedRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }
        res.json(updatedRoom);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating chat room' });
    }
}));
// Delete a chat room by ID
router.delete('/chatrooms/:id', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.id;
        const deletedRoom = yield ChatRooms_1.default.findByIdAndDelete(roomId);
        if (!deletedRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }
        res.json({ message: 'Chat room deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting chat room' });
    }
}));
exports["default"] = router;


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const mongoose_1 = tslib_1.__importStar(__webpack_require__(6));
const chatRoomSchema = new mongoose_1.Schema({
    name: String,
    description: String,
    messages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Message' }],
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }], // Reference to User documents
});
const ChatRoom = mongoose_1.default.model('ChatRoom', chatRoomSchema);
exports["default"] = ChatRoom;


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
const http = tslib_1.__importStar(__webpack_require__(8));
const socket_io_1 = __webpack_require__(9);
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(10));
const User_1 = tslib_1.__importDefault(__webpack_require__(11));
const Message_1 = tslib_1.__importDefault(__webpack_require__(12));
const chatRoomRoute_1 = tslib_1.__importDefault(__webpack_require__(13));
const app = (0, express_1.default)();
const server = http.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
});
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
app.get('/api/user', (req, res) => {
    const token = req.cookies.token;
    // console.log("decoded",token)
    const userInfo = jsonwebtoken_1.default.verify(token, secret);
    // console.log("decoded",userInfo)
    User_1.default.findById(userInfo.id)
        .then((user) => { const { _id, email, firstName, lastName } = user; res.json({ _id, email, firstName, lastName }); })
        .catch((err) => {
        console.log(err);
        res.sendStatus(500);
    });
});
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
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    User_1.default.findOne({ email }).then(user => {
        if (user && user.email) {
            const passOk = bcrypt_1.default.compareSync(password, user.password);
            // res.json({passOk});
            if (passOk) {
                jsonwebtoken_1.default.sign({ id: user._id }, secret, (err, token) => {
                    const { firstName, lastName, email } = user;
                    const responseData = {
                        message: "Login successful",
                        data: { firstName, lastName, email }
                        // Add any other data you want to send
                    };
                    res.cookie('token', token);
                    res.status(200).json(responseData);
                });
            }
            else {
                res.sendStatus(422).json("Invalid Username or password");
            }
        }
        else {
            res.sendStatus(422).json("Invalid Username or password");
        }
    });
});
// Use chat room routes
app.use('/api', chatRoomRoute_1.default);
const port = process.env.PORT || 3333;
server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
const onlineUsers = new Map();
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });
    socket.on('chatMessage', (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            // Ensure that the message object contains necessary properties
            if (!data.message || !data.message.senderInfo || !data.message.chatRoomId || !data.message.text) {
                console.error('Invalid message received:', data.message);
                return;
            }
            const message = data.message;
            console.log(`Received message from ${JSON.stringify(message.senderInfo)} in room ${message.chatRoomId}: ${message.text}`);
            // Create a new message instance
            const newMessage = new Message_1.default({
                senderInfo: `${message.senderInfo._id}`,
                text: message.text,
                chatRoomId: message.chatRoomId
            });
            // Save the message to the database
            yield newMessage.save();
            console.log('Message saved to the database');
            socket.join(message.chatRoomId);
            // Broadcast the message to all connected clients
            socket.to(message.chatRoomId).emit('receive_message', newMessage);
        }
        catch (error) {
            console.error('Error handling message:', error);
        }
    }));
    // Handle 'pong' messages
    socket.on('pong', () => {
        // You can optionally log or perform actions upon receiving a 'pong' message.
        console.log("ping pong connection on");
    });
    // Handle disconnections
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Remove the socket from the active connections map
        // activeConnections.delete(socket);
    });
});

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map