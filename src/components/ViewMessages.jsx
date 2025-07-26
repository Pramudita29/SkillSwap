import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import api from '../utils/api';

const ViewMessagesPage = ({ darkMode }) => {
    const navigate = useNavigate();
    const [activeUsers, setActiveUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messagesData, setMessagesData] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const socketConnection = io('http://localhost:3000', {
            withCredentials: true
        });
        setSocket(socketConnection);

        const userId = localStorage.getItem('userId');
        if (userId) {
            socketConnection.emit('join', userId);
        }

        socketConnection.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socketConnection.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            toast.error('Failed to connect to chat server. Please try again.');
        });

        socketConnection.on('newMessage', (message) => {
            setMessagesData((prevMessages) => [...prevMessages, message]);
            scrollToBottom();
        });

        socketConnection.on('typing', ({ userId }) => {
            if (selectedUser?._id === userId) {
                setIsTyping(true);
            }
        });

        socketConnection.on('stopTyping', ({ userId }) => {
            if (selectedUser?._id === userId) {
                setIsTyping(false);
            }
        });

        return () => {
            socketConnection.close();
        };
    }, [selectedUser]);

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const response = await api.get('/message/active');
                console.log('Active users response:', response);
                console.log('Response data:', response.data);
                const users = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
                if (users.length === 0) {
                    console.warn('No active users found in response');
                }
                const userId = localStorage.getItem('userId');
                const filteredUsers = users.filter((user) => user._id !== userId);
                setActiveUsers(filteredUsers);
            } catch (error) {
                console.error('Error fetching active users:', error.message, error.response, error);
                toast.error(error.response?.data?.error || 'Failed to load active users.');
            }
        };

        fetchActiveUsers();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messagesData]);

    const fetchMessages = async (partnerId) => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) throw new Error('User ID not found in localStorage');
            const response = await api.get(`/message/${userId}/${partnerId}`);
            console.log('Fetch messages response:', response);
            console.log('Messages received:', response.data);
            const messages = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
            setMessagesData(messages);
        } catch (error) {
            console.error('Error fetching messages:', error.response || error.message, error);
            toast.error(error.response?.data?.error || 'Failed to load messages.');
            setMessagesData([]);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setMessagesData([]);
        fetchMessages(user._id);
    };

    const handleSendMessage = async () => {
        if (newMessage && selectedUser) {
            try {
                const userId = localStorage.getItem('userId');
                const message = {
                    from: userId,
                    to: selectedUser._id,
                    text: newMessage,
                    time: new Date().toISOString(),
                };

                socket.emit('sendMessage', message);
                await api.post('/message/send', message);
                setNewMessage('');
                toast.success('Message sent!');
            } catch (error) {
                console.error('Error sending message:', error.response || error.message, error);
                toast.error(error.response?.data?.error || 'Failed to send message.');
            }
        }
    };

    const handleTyping = () => {
        if (socket && selectedUser) {
            socket.emit('typing', { userId: localStorage.getItem('userId'), to: selectedUser._id });
            setTimeout(() => {
                socket.emit('stopTyping', { userId: localStorage.getItem('userId'), to: selectedUser._id });
            }, 3000);
        }
    };

    const formatTimestamp = (time) => {
        return new Date(time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div
            className={`h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} overflow-hidden`}
        >
            <div className="max-w-5xl w-full mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col md:flex-row h-[85vh]">
                {/* Active Users Sidebar */}
                <div className="w-full md:w-1/3 border-r dark:border-gray-700 overflow-y-auto">
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-bold">Chats</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {activeUsers.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => handleSelectUser(user)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSelectUser(user)}
                                tabIndex={0}
                                role="button"
                                aria-label={`Select chat with ${user.name}`}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedUser?._id === user._id
                                    ? 'bg-blue-100 dark:bg-blue-900'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        user.name
                                    )}&size=40&rounded=true&background=random`}
                                    alt={`${user.name}'s avatar`}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                        {user.lastMessage ? user.lastMessage : 'No recent messages'}
                                    </p>
                                </div>
                                <span
                                    className={`w-3 h-3 rounded-full ${typeof user.isOnline === 'boolean' ? (user.isOnline ? 'bg-green-400' : 'bg-gray-400') : 'bg-gray-400'
                                        }`}
                                    aria-label={typeof user.isOnline === 'boolean' ? (user.isOnline ? 'Online' : 'Offline') : 'Offline'}
                                ></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Messages Thread */}
                <div className="w-full md:w-2/3 flex flex-col">
                    <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center">
                            {selectedUser && (
                                <>
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            selectedUser.name
                                        )}&size=40&rounded=true&background=random`}
                                        alt={`${selectedUser.name}'s avatar}`}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <div>
                                        <h1 className="text-xl font-bold">{selectedUser.name}</h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {typeof selectedUser.isOnline === 'boolean' ? (selectedUser.isOnline ? 'Online' : 'Last seen recently') : 'Offline'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                        >
                            Back
                        </button>
                    </div>

                    <div
                        ref={messagesContainerRef}
                        className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900"
                    >
                        {messagesData.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                No messages yet. Start the conversation!
                            </p>
                        )}
                        {messagesData.map((message, index) => {
                            const isSentByCurrentUser = message.from._id === localStorage.getItem('userId');
                            const showAvatar = index === 0 || messagesData[index - 1].from._id !== message.from._id;
                            return (
                                <div
                                    key={message._id || `${message.from._id}-${message.time}-${index}`}
                                    className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
                                >
                                    <div className="flex items-end max-w-[70%]">
                                        {!isSentByCurrentUser && showAvatar && (
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    message.from.name
                                                )}&size=32&rounded=true&background=random`}
                                                alt={`${message.from.name}'s avatar`}
                                                className="w-8 h-8 rounded-full mr-2 mt-2"
                                            />
                                        )}
                                        <div
                                            className={`relative p-3 rounded-2xl shadow-sm ${isSentByCurrentUser
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'
                                                }`}
                                        >
                                            {showAvatar && (
                                                <p className="text-xs font-medium mb-1">{message.from.name}</p>
                                            )}
                                            <p className="text-sm">{message.text}</p>
                                            <div className="flex items-center justify-end mt-1">
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    {formatTimestamp(message.time)}
                                                </p>
                                                {isSentByCurrentUser && (
                                                    <span className="ml-2 text-xs">
                                                        {message.read ? (
                                                            <span className="text-blue-200">✓✓</span>
                                                        ) : (
                                                            <span className="text-blue-300">✓</span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className={`absolute bottom-0 w-3 h-3 ${isSentByCurrentUser
                                                    ? 'right-[-6px] bg-blue-500'
                                                    : 'left-[-6px] bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                                style={{
                                                    clipPath: isSentByCurrentUser
                                                        ? 'polygon(0 0, 100% 0, 100% 100%)'
                                                        : 'polygon(0 0, 100% 0, 0 100%)',
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && selectedUser && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                                        {selectedUser.name} is typing...
                                    </p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {selectedUser && (
                        <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center space-x-4">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    rows="2"
                                    className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type a message..."
                                    aria-label="Message input"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-blue-600 transition-all duration-200"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewMessagesPage;