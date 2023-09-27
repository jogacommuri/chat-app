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
const chatRoomSchema = new mongoose_1.Schema({
    name: String,
    description: String,
    messages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Message' }],
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }], // Reference to User documents
});
const ChatRoom = mongoose_1.default.model('ChatRoom', chatRoomSchema);
exports["default"] = ChatRoom;


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const mongoose_1 = tslib_1.__importStar(__webpack_require__(6));
const messageSchema = new mongoose_1.Schema({
    senderInfo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    timestamp: { type: Date, default: Date.now },
    chatRoomId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ChatRoom' },
    systemMessage: { type: Boolean, default: false }
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports["default"] = Message;


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const mongoose_1 = tslib_1.__importDefault(__webpack_require__(6));
const ChatRooms_1 = tslib_1.__importDefault(__webpack_require__(12));
const Message_1 = tslib_1.__importDefault(__webpack_require__(13));
const User_1 = tslib_1.__importDefault(__webpack_require__(11));
const jsonwebtoken_1 = tslib_1.__importDefault(__webpack_require__(10));
const ObjectId = mongoose_1.default.Types.ObjectId;
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
router.get('/chatroom/:roomId/messages', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    if (!ObjectId.isValid(roomId)) {
        return res.status(400).json({ error: 'Invalid roomId format' });
    }
    try {
        // Use MongoDB aggregation to join messages with user names and additional attributes
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
                    'senderInfo._id': 1,
                    'systemMessage': 1,
                }
            }
        ]);
        // Fetch the chat room and its users
        const chatRoom = yield ChatRooms_1.default.findById(roomId)
            .populate('users', '-password') // Populate the 'users' field with user documents
            .exec();
        if (!chatRoom) {
            throw new Error('Chat room not found');
        }
        const userObjectIds = [];
        // Iterate through users and add their IDs to the array
        chatRoom.users.forEach((userObjectId) => {
            userObjectIds.push(userObjectId);
        });
        // Optionally, fetch additional attributes for users here
        const usersWithAdditionalAttributes = yield User_1.default.find({
            _id: { $in: userObjectIds }, // Filter users by their IDs
        });
        res.json({
            chatRoomName: chatRoom.name,
            chatRoomUsers: usersWithAdditionalAttributes,
            messages
        });
    }
    catch (error) {
        console.error('Error fetching chat room messages:', error);
        res.status(500).json({ error: 'Failed to fetch chat room messages' });
    }
}));
router.post('/join/:roomId', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const roomId = req.params.roomId;
    const token = req.headers.authorization;
    ;
    const { firstName, lastName } = req.body;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Verify the user's token and get user information
        const userInfo = jsonwebtoken_1.default.verify(token, secret);
        //console.log(JSON.stringify(userInfo))
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
        const joinMessage = new Message_1.default({
            senderInfo: userInfo.id,
            text: `${firstName} ${lastName} has joined the chat.`,
            chatRoomId: roomId,
            systemMessage: true, // Set as a system message
        });
        // Save the updated chat room
        yield Promise.all([chatRoom.save(), joinMessage.save()]);
        // Optionally, you can send back the updated chat room data to the client
        res.status(200).json({ message: 'Successfully joined the chat room', chatRoom });
    }
    catch (error) {
        console.error('Error joining chat room:', error);
        res.status(500).json({ error: 'Failed to join the chat room' });
    }
}));
router.post('/leave/:roomId', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const token = req.headers.authorization;
    ;
    const { firstName, lastName } = req.body;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Remove the user from the chat room in the database
        // For example, if you have a "chatRoom" model, you can use Mongoose to update it
        // Update the database to remove the user from the room's user list
        const userInfo = jsonwebtoken_1.default.verify(token, secret);
        //console.log(JSON.stringify(userInfo))
        const chatRoom = yield ChatRooms_1.default.findById(roomId);
        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }
        // Check if the user is a participant in the chat room
        const userId = userInfo.id.toString();
        const userIndex = chatRoom.users.findIndex((user) => user.toString() === userId);
        if (userIndex === -1) {
            return res.status(400).json({ error: 'User is not in the chat room' });
        }
        chatRoom.users.splice(userIndex, 1);
        const leaveMessage = new Message_1.default({
            senderInfo: userInfo.id,
            text: `${firstName} ${lastName} has left the chat.`,
            chatRoomId: roomId,
            systemMessage: true,
        });
        yield Promise.all([chatRoom.save(), leaveMessage.save()]);
        res.status(200).json({ message: 'Successfully left the chat room' });
    }
    catch (error) {
        console.error('Error leaving chat room:', error);
        res.status(500).json({ error: 'Internal server error' });
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
const ChatRooms_1 = tslib_1.__importDefault(__webpack_require__(12));
const Message_1 = tslib_1.__importDefault(__webpack_require__(13));
const chatRoomRoute_1 = tslib_1.__importDefault(__webpack_require__(14));
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
    //const token = req.cookies.token;
    const token = req.headers.authorization;
    //console.log("decoded",token)
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
    //console.log(req.body);
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
                    const { firstName, lastName, email, _id } = user;
                    const responseData = {
                        message: "Login successful",
                        data: { firstName, lastName, email, _id }
                    };
                    res.cookie('token', token);
                    res.status(200).json({ _id, email, firstName, lastName, token });
                    //res.json({_id,email, firstName, lastName})
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
const activeUsers = new Map();
io.on('connection', (socket) => {
    socket.emit('connectionStatus', 'active');
    console.log(`User connected: ${socket.id}`);
    // When a user joins a specific chat room, emit a message to that room
    socket.on('joinRoom', (chatRoomId, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        socket.join(chatRoomId);
        console.log(`${user.firstName} ${user.lastName} has joined the chat room - ${chatRoomId}.`);
        try {
            // Use MongoDB aggregation to join messages with user names
            const messages = yield Message_1.default.aggregate([
                {
                    $match: { chatRoomId: new mongoose_1.default.Types.ObjectId(chatRoomId) }
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
                        'senderInfo._id': 1,
                        'systemMessage': 1,
                    }
                }
            ]);
            socket.to(chatRoomId).emit('systemMessage', messages);
        }
        catch (error) {
            console.error('Error fetching chat room messages:', error);
            // res.status(500).json({ error: 'Failed to fetch chat room messages' });
        }
        activeUsers.set(socket.id, { chatRoomId: chatRoomId, user });
    }));
    socket.on('leaveRoom', (chatRoomId, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // const userData = activeUsers.get(socket.id);
        // socket.leave(chatRoomId);
        // console.log(`${user.firstName} ${user.lastName} has left the chat room.`);
        // io.to(chatRoomId).emit('systemMessage', `${user.firstName} ${user.lastName} has left the chat.`);
        // // Remove the user from the 'users' Map
        // activeUsers.delete(socket.id);
        // if (userData) {
        //   const { user } = userData;
        // socket.leave(chatRoomId);
        console.log(`${user.firstName} ${user.lastName} has left the chat room.`);
        try {
            // Use MongoDB aggregation to join messages with user names
            const messages = yield Message_1.default.aggregate([
                {
                    $match: { chatRoomId: new mongoose_1.default.Types.ObjectId(chatRoomId) }
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
                        'senderInfo._id': 1,
                        'systemMessage': 1,
                    }
                }
            ]);
            socket.to(chatRoomId).emit('systemMessage', messages);
            console.log(`Emitting ${JSON.stringify(messages)}to chatRoom - ${chatRoomId} as systemMessage`);
        }
        catch (error) {
            console.error('Error fetching chat room messages:', error);
            // res.status(500).json({ error: 'Failed to fetch chat room messages' });
        }
        // Remove the user from the 'activeUsers' Map
        socket.leave(chatRoomId);
        activeUsers.delete(socket.id);
        // }
    }));
    socket.on('chatMessage', (chatRoomId, user, messageText) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        socket.join(chatRoomId);
        try {
            // Ensure that the message object contains necessary properties
            if (!chatRoomId || !user || !messageText) {
                console.error('Invalid message received:', { chatRoomId, user, messageText });
                return;
            }
            // const message = data.message
            console.log(`Received message from ${JSON.stringify(user)} in room ${chatRoomId}: ${messageText}`);
            // Create a new message instance
            const newMessage = new Message_1.default({
                senderInfo: user,
                text: messageText,
                chatRoomId: chatRoomId
            });
            // Save the message to the database
            yield newMessage.save();
            console.log('Message saved to the database');
            //socket.join(message.chatRoomId)
            // Broadcast the message to all connected clients
            try {
                // Use MongoDB aggregation to join messages with user names
                const messages = yield Message_1.default.aggregate([
                    {
                        $match: { chatRoomId: new mongoose_1.default.Types.ObjectId(chatRoomId) }
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
                            'senderInfo._id': 1,
                            'systemMessage': 1,
                        }
                    }
                ]);
                // Optionally, you can also fetch the chat room name
                const chatRoom = yield ChatRooms_1.default.findById(chatRoomId, 'name');
                console.log(`Recent message - ${JSON.stringify(messages[messages.length - 1])} in room ${chatRoomId}`);
                socket.to(chatRoomId).emit('receive_message', messages);
            }
            catch (error) {
                console.error('Error fetching chat room messages:', error);
                // res.status(500).json({ error: 'Failed to fetch chat room messages' });
            }
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
        socket.emit('connectionStatus', 'disconnected');
        const userData = activeUsers.get(socket.id);
        // console.log(`User disconnected: ${socket.id}`);
        // io.to(chatRoomId).emit('systemMessage', `${user.firstName} ${user.lastName} has left the chat.`);
        // socket.leave(chatRoomId);
        // activeUsers.delete(socket.id);
        if (userData) {
            const { roomId, user } = userData;
            // Remove the user from the 'activeUsers' Map
            activeUsers.delete(socket.id);
            // Emit a system message to notify other users when someone disconnects
            io.to(roomId).emit('systemMessage', `${user.firstName} ${user.lastName} has left the chat.`);
            // Leave the room
            socket.leave(roomId);
        }
    });
});

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map