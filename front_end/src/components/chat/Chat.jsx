import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Chat = () => {
  const { token, user, socket } = useSelector((state) => ({
    ...state.auth,
    socket: state.chat.socket
  }));
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatRooms();
  }, [token]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
    }
  }, [selectedRoom, token]);

  useEffect(() => {
    if (socket && selectedRoom) {
      socket.on('message', handleNewMessage);
      socket.on('userOnline', handleUserOnline);
      socket.on('userOffline', handleUserOffline);
      socket.on('messageSeen', handleMessageSeen);

      return () => {
        socket.off('message');
        socket.off('userOnline');
        socket.off('userOffline');
        socket.off('messageSeen');
      };
    }
  }, [socket, selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get('/api/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatRooms(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch chat rooms');
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`/api/chat/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      if (socket) {
        socket.emit('joinRoom', roomId);
      }
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleUserOnline = (userId) => {
    setOnlineUsers(prev => new Set([...prev, userId]));
  };

  const handleUserOffline = (userId) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const handleMessageSeen = (data) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, seenBy: [...msg.seenBy, data.userId] }
          : msg
      )
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await axios.post(
        `/api/chat/rooms/${selectedRoom.id}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (socket) {
        socket.emit('sendMessage', {
          roomId: selectedRoom.id,
          message: response.data
        });
      }

      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewChatRoom = async () => {
    const name = prompt('Enter chat room name:');
    if (!name) return;

    try {
      const response = await axios.post(
        '/api/chat/rooms',
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatRooms(prev => [...prev, response.data]);
      toast.success('Chat room created successfully');
    } catch (error) {
      toast.error('Failed to create chat room');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Rooms Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Chat Rooms</h2>
          {user.isTeamLeader && (
            <button
              onClick={createNewChatRoom}
              className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              New Chat Room
            </button>
          )}
        </div>
        <div className="overflow-y-auto h-full">
          {chatRooms.map(room => (
            <div
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedRoom?.id === room.id ? 'bg-indigo-50' : ''
              }`}
            >
              <h3 className="font-medium">{room.name}</h3>
              <p className="text-sm text-gray-500">
                {room.members.length} members
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white p-4 border-b">
            <h2 className="text-xl font-semibold">{selectedRoom.name}</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender.id === user.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${
                    message.sender.id === user.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200'
                  } rounded-lg px-4 py-2`}
                >
                  {message.sender.id !== user.id && (
                    <p className="text-xs font-medium mb-1">
                      {message.sender.name}
                    </p>
                  )}
                  <p>{message.content}</p>
                  <div className="text-xs mt-1 flex justify-between">
                    <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
                    <span>
                      {message.seenBy.length > 0 && '✓✓'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="bg-white p-4 border-t">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Select a chat room to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
