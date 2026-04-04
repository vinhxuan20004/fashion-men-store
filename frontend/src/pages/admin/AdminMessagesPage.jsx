import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  User, 
  Send, 
  Filter,
  MoreVertical,
  Mail,
  Calendar,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { messageAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import socket from '../../services/socket'

const AdminMessagesPage = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [threadMessages, setThreadMessages] = useState([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [threadMessages])

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await messageAPI.getConversations()
      setConversations(res.data.data.conversations || [])
    } catch (error) {
      toast.error('Không thể tải danh sách cuộc trò chuyện')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchThreadHistory = async (email) => {
    setLoadingThread(true)
    try {
      const res = await messageAPI.getConversationHistory(email)
      setThreadMessages(res.data.data.messages || [])
    } catch (error) {
      toast.error('Không thể tải lịch sử trò chuyện')
    } finally {
      setLoadingThread(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Listen for REAL-TIME messages
  useEffect(() => {
    socket.on('new_message', (msg) => {
      // 1. Update conversations list
      setConversations(prev => {
        const index = prev.findIndex(c => c.email === msg.email)
        const updatedConv = {
          _id: msg.email,
          name: msg.name,
          email: msg.email,
          lastMessage: msg.message,
          lastCreatedAt: msg.createdAt,
          status: msg.status,
          unreadCount: (index !== -1 ? prev[index].unreadCount : 0) + 1
        }
        
        if (index !== -1) {
          const newConvs = [...prev]
          newConvs.splice(index, 1) // Remove old
          return [updatedConv, ...newConvs] // Add to top
        }
        return [updatedConv, ...prev]
      })

      // 2. If viewing this conversation, append message
      if (selectedConversation && selectedConversation.email === msg.email) {
        setThreadMessages(prev => [...prev, msg])
      }

      toast.success(`Tin nhắn mới từ ${msg.name}!`, { icon: '💬', duration: 4000 })
    })

    return () => socket.off('new_message')
  }, [selectedConversation])

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv)
    fetchThreadHistory(conv.email)
    
    // Mark as read locally in list
    setConversations(prev => prev.map(c => 
      c.email === conv.email ? { ...c, unreadCount: 0, status: 'READ' } : c
    ))
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedConversation || threadMessages.length === 0) return

    // We reply to the LAST message in the thread
    const lastMsg = threadMessages[threadMessages.length - 1]

    try {
      const res = await messageAPI.reply(lastMsg._id, { message: replyText })
      toast.success('Đã gửi phản hồi!')
      setReplyText('')
      
      // Update thread locally
      const updatedMsg = res.data.data.message
      setThreadMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m))
      
      // Update conversation list locally
      setConversations(prev => prev.map(c => 
        c.email === selectedConversation.email ? { ...c, status: 'REPLIED' } : c
      ))
    } catch (error) {
      toast.error('Gửi phản hồi thất bại')
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const term = searchTerm.toLowerCase()
    return conv.name.toLowerCase().includes(term) || conv.email.toLowerCase().includes(term) || conv.lastMessage.toLowerCase().includes(term)
  })

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Hộp thư hỗ trợ</h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Quản lý hội thoại theo khách hàng</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Sidebar: Conversation List */}
          <div className="w-1/3 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Tìm kiếm hội thoại..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-primary-50 transition-all"
                 />
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                   <AlertCircle className="w-10 h-10 text-gray-100 mb-3" />
                   <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Không có hội thoại nào</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.email}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-5 border-b border-gray-50 cursor-pointer transition-all hover:bg-slate-50 relative group ${
                      selectedConversation?.email === conv.email ? 'bg-slate-50 border-r-4 border-r-primary-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            conv.status === 'UNREAD' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {conv.status === 'UNREAD' ? 'Mới' : 'Đã xem'}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full flex items-center justify-center min-w-[18px]">
                              {conv.unreadCount}
                            </span>
                          )}
                       </div>
                       <span className="text-[10px] font-bold text-gray-300">{formatDate(conv.lastCreatedAt)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase truncate">{conv.name}</h4>
                    <p className="text-[11px] font-bold text-gray-400 mt-1 line-clamp-1 italic">"{conv.lastMessage}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main: Chat Thread */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
            {selectedConversation ? (
              <>
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-lg font-bold italic shadow-lg shadow-gray-200">
                       {selectedConversation.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight">{selectedConversation.name}</h2>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mt-1">
                          <Mail className="w-3 h-3" />
                          {selectedConversation.email}
                        </div>
                     </div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar flex flex-col">
                   {loadingThread ? (
                     <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
                   ) : (
                     threadMessages.map((msg, idx) => (
                       <React.Fragment key={msg._id}>
                          {/* Customer Message */}
                          <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                               <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="max-w-[80%]">
                               <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-gray-100">
                                  <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                                    "{msg.message}"
                                  </p>
                               </div>
                               <span className="text-[9px] font-bold text-gray-300 mt-1.5 block ml-2 uppercase tracking-widest">{formatDate(msg.createdAt)}</span>
                            </div>
                          </div>

                          {/* Admin Reply if exists */}
                          {msg.reply && (
                            <div className="flex flex-row-reverse gap-4">
                               <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-100">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                               </div>
                               <div className="max-w-[80%] flex flex-col items-end">
                                  <div className="bg-primary-600 p-4 rounded-3xl rounded-tr-none shadow-premium text-white">
                                     <p className="text-sm font-bold leading-relaxed">
                                       {msg.reply.message}
                                     </p>
                                  </div>
                                  <span className="text-[9px] font-bold text-primary-600 mt-1.5 mr-2 block uppercase tracking-widest">{formatDate(msg.reply.repliedAt)}</span>
                               </div>
                            </div>
                          )}
                       </React.Fragment>
                     ))
                   )}
                   <div ref={messagesEndRef} />
                </div>

                <div className="p-6 border-t border-gray-50 bg-white">
                   <form onSubmit={handleReply} className="relative flex items-center gap-3">
                      <div className="flex-1 relative">
                        <textarea 
                          rows="1"
                          placeholder="Nhập nội dung phản hồi..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full pl-5 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-slate-800 placeholder:text-gray-300 focus:bg-white focus:border-primary-600 focus:ring-0 transition-all resize-none overflow-hidden"
                        />
                        <button 
                          type="submit"
                          disabled={!replyText.trim() || loadingThread}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-primary-600 disabled:opacity-30 disabled:hover:bg-gray-900 transition-all active:scale-95"
                        >
                           <Send className="w-4 h-4" />
                        </button>
                      </div>
                   </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50/10">
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 relative">
                    <MessageSquare className="w-10 h-10 text-gray-100" />
                    <div className="absolute top-0 right-0 w-6 h-6 bg-primary-500 border-4 border-white rounded-full animate-ping"></div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Chọn cuộc hội thoại</h3>
                 <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em] max-w-xs leading-loose">
                   Chọn từ danh sách bên trái để phản hồi khách hàng
                 </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMessagesPage
