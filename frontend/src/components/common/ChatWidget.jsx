import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, Bot, Minus } from 'lucide-react'
import { messageAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import socket from '../../services/socket'

const ChatWidget = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: 'Chào mừng bạn đến với Men\'s Fashion Store! 👋', sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { id: 2, text: 'Tôi có thể giúp gì cho bạn hôm nay?', sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [isOpen, messages, isTyping])

  // 1. Load chat history on mount or user change
  useEffect(() => {
    const loadHistory = async () => {
      // Clear messages to initial state first
      const initialMessages = [
        { id: 1, text: 'Chào mừng bạn đến với Men\'s Fashion Store! 👋', sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: 2, text: 'Tôi có thể giúp gì cho bạn hôm nay?', sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]

      if (user) {
        try {
          const res = await messageAPI.getMyMessages()
          const apiMessages = res.data.data.messages
          
          if (apiMessages && apiMessages.length > 0) {
            const formatted = apiMessages.flatMap(msg => {
              const chatItems = [
                {
                  id: msg._id,
                  text: msg.message,
                  sender: 'user',
                  time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]
              if (msg.reply) {
                chatItems.push({
                  id: msg._id + '_reply',
                  text: msg.reply.message,
                  sender: 'bot',
                  time: new Date(msg.reply.repliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })
              }
              return chatItems
            })
            setMessages([...initialMessages, ...formatted])
          } else {
            setMessages(initialMessages)
          }
        } catch (error) {
          console.error('Failed to load chat history:', error)
          setMessages(initialMessages)
        }
      } else {
        // Guest: load from localStorage
        const saved = localStorage.getItem('guest_chat_history')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed) && parsed.length > 0) {
               setMessages(parsed)
            } else {
               setMessages(initialMessages)
            }
          } catch (e) {
            setMessages(initialMessages)
          }
        } else {
          setMessages(initialMessages)
        }
      }
    }
    loadHistory()
  }, [user])

  // 2. Save guest messages to localStorage whenever they change
  useEffect(() => {
    if (!user && messages.length > 2) {
      localStorage.setItem('guest_chat_history', JSON.stringify(messages))
    }
  }, [messages, user])

  // 3. Listen for REAL-TIME replies from Admin
  useEffect(() => {
    socket.on('reply_received', (data) => {
      // Check if this reply is for current user/guest
      const isMyReply = (user && data.userId === user._id) || (!user && !data.userId);
      
      if (isMyReply) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const socketReply = {
            id: `${data.messageId}_reply_live`,
            text: data.reply.message,
            sender: 'bot',
            time: new Date(data.reply.repliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === socketReply.id)) return prev;
            return [...prev, socketReply];
          });
        }, 1000);
      }
    });

    return () => {
      socket.off('reply_received');
    };
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const messageText = inputValue
    const userMsg = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')

    try {
      // Real API call to persist message
      await messageAPI.sendMessage({
        message: messageText,
        name: user?.name,
        email: user?.email
      })
    } catch (error) {
      console.error('Chat sending failed:', error)
    }
  }

  // Force Be Vietnam Pro font on the main container for header, body, footer consistency
  const widgetStyle = {
    fontFamily: '"Be Vietnam Pro", sans-serif'
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] antialiased" style={widgetStyle}>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-primary-600 hover:scale-110 transition-all duration-300 group relative"
        >
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 px-3 py-2 bg-white text-gray-900 text-[11px] font-bold uppercase tracking-tight whitespace-nowrap rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-100">
             Hỗ trợ trực tuyến 
             <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white border-r border-t border-gray-100 rotate-45"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-10 fade-in duration-500">
          {/* Header (Uses BE VN) */}
          <div className="p-6 bg-gray-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                   <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-tight">Hỗ Trợ Khách Hàng</h3>
                <div className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                   <span className="text-[10px] font-bold text-emerald-400">Đang trực tuyến</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area (Body) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div key={msg.id || index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gray-900 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 font-bold">{msg.time}</span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                   <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                   <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                   <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area (Footer) */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium text-gray-900 focus:bg-white focus:border-gray-900 focus:ring-0 transition-all placeholder:text-gray-400"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 p-2 bg-gray-900 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-30 disabled:hover:bg-gray-900"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-normal">
               Điện thoại: 090.123.4567 • Email: support@domain.com
            </p>
          </form>
        </div>
      )}
    </div>
  )
}

export default ChatWidget
