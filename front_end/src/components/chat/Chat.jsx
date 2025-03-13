import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  fetchChatRooms,
  fetchChatMessages,
  setCurrentRoom,
  sendMessage,
  markMessageAsSeen,
  createChatRoom,
  addMemberToChatRoom,
  fetchOnlineUsers,
} from '../../store/slices/chatSlice';

const Chat = () => {
  const dispatch = useDispatch();
  const { user, team } = useSelector((state) => state.auth);
  const {
    chatRooms,
    currentRoom,
    messages,
    loading,
    error,
    onlineUsers,
    socket,
  } = useSelector((state) => state.chat);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Get messages for the current room
  const currentMessages = currentRoom ? messages[currentRoom.id] || [] : [];

  useEffect(() => {
    if (team?.id) {
      dispatch(fetchChatRooms(team.id));
      dispatch(fetchOnlineUsers(team.id));
    }
  }, [dispatch, team?.id]);

  useEffect(() => {
    if (selectedRoom) {
      dispatch(fetchChatMessages(selectedRoom.id));
    }
  }, [selectedRoom, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateRoom = (roomData) => {
    dispatch(
      createChatRoom({
        name: roomData.name,
        teamId: team.id,
        creatorId: user.id,
      })
    );
  };

  const handleAddMember = (memberData) => {
    dispatch(
      addMemberToChatRoom({
        chatRoomId: currentRoom.id,
        userId: memberData.userId,
        addedByUserId: user.id,
      })
    );
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    dispatch(setCurrentRoom(room));
    dispatch(fetchChatMessages(room.id));
    if (socket) {
      socket.emit('joinChatRoom', room.id);
    }
  };

  const handleSendMessage = () => {
    if ((!messageText.trim() && !imageFile) || !currentRoom) return;

    const messageData = {
      content: messageText.trim(),
      chatRoomId: currentRoom.id,
      senderId: user.id,
      imageFile: imageFile,
    };

    if (socket) {
      socket.emit('sendMessage', messageData);
    }

    dispatch(sendMessage(messageData));

    setMessageText('');
    setImageFile(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Rooms Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Chat Rooms</h2>
          {user?.isTeamLeader && (
            <button
              onClick={() => {
                const name = prompt('Enter chat room name:');
                if (name) {
                  handleCreateRoom({ name });
                }
              }}
              className="mt-2 w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              New Chat Room
            </button>
          )}
        </div>
        <div className="overflow-y-auto h-full">
          {chatRooms?.map((room) => (
            <div
              key={room.id}
              onClick={() => handleRoomSelect(room)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedRoom?.id === room.id ? 'bg-indigo-50' : ''
              }`}
            >
              <h3 className="font-medium">{room.name}</h3>
              <p className="text-sm text-gray-500">
                {room.members?.length || 0} members
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
            {currentMessages && Array.isArray(currentMessages) ? (
              currentMessages.map((message) => (
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
                      <span>{message.seenBy?.length > 0 && '✓✓'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No messages in this room yet.</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="bg-white p-4 border-t"
          >
            <div className="flex space-x-4">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
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
          <p className="text-gray-500">
            Select a chat room to start messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default Chat;