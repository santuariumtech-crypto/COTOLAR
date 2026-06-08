"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip, Loader2, Image as ImageIcon, Search, MessageSquare } from "lucide-react"
import { toast, Toaster } from "sonner"
import { supabase } from "@/lib/supabase"
import { getMessages, sendMessage, getAdminChats } from "@/app/actions/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type ChatUser = {
  id: string
  nombre: string
  apellido: string
  avatar_url: string
  lastMessage: string
  lastMessageDate: string
  isRead: boolean
}

export default function AdminInboxPage() {
  const [chats, setChats] = useState<ChatUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  
  const [adminId, setAdminId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setAdminId(user.id)
    })

    loadChats()

    // Global listener for new messages
    const channel = supabase
      .channel('admin:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=is.null`
      }, () => {
        // Recargar sidebar al recibir nuevo mensaje
        loadChats()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId)
    } else {
      setMessages([])
    }
  }, [selectedUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChats = async () => {
    const data = await getAdminChats()
    setChats(data)
    setLoadingChats(false)
  }

  const loadMessages = async (userId: string) => {
    setLoadingMsgs(true)
    const msgs = await getMessages(userId)
    setMessages(msgs)
    setLoadingMsgs(false)
  }

  const handleSend = async (e?: React.FormEvent, attachmentUrl?: string) => {
    if (e) e.preventDefault()
    if (!selectedUserId || !adminId) return
    if (!input.trim() && !attachmentUrl) return

    const currentInput = input
    setInput("")
    setSending(true)

    // Optimistic UI
    const tempMsg = {
      id: crypto.randomUUID(),
      sender_id: adminId,
      receiver_id: selectedUserId,
      content: currentInput,
      attachment_url: attachmentUrl || null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    const result = await sendMessage(adminId, selectedUserId, currentInput, attachmentUrl)
    
    if (!result.success) {
      toast.error("Error al enviar")
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id))
      setInput(currentInput)
    } else {
      loadChats() // Update sidebar last message
    }
    setSending(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    const ext = file.name.split('.').pop()
    const fileName = `admin_chat_${Date.now()}.${ext}`
    
    try {
      const { error } = await supabase.storage.from('attachments').upload(fileName, file)
      if (error) throw error
      
      const { data } = supabase.storage.from('attachments').getPublicUrl(fileName)
      await handleSend(undefined, data.publicUrl)
      toast.success("Adjunto enviado")
    } catch (error) {
      toast.error("Error al subir archivo")
    } finally {
      setUploadingFile(false)
    }
  }

  const selectedUser = chats.find(c => c.id === selectedUserId)

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <Toaster richColors position="top-right" />
      
      {/* Sidebar de Chats */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar profesional..." 
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No hay chats activos.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedUserId(chat.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-white
                    ${selectedUserId === chat.id ? 'bg-white border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
                  `}
                >
                  <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                    <AvatarImage src={chat.avatar_url} />
                    <AvatarFallback>{chat.nombre?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`text-sm truncate ${!chat.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {chat.nombre} {chat.apellido}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {format(new Date(chat.lastMessageDate), "dd MMM", { locale: es })}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${!chat.isRead ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                      {chat.lastMessage || "Adjunto enviado"}
                    </p>
                  </div>
                  {!chat.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área de Chat (Derecha) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        {!selectedUserId ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare className="h-12 w-12 mb-3 text-slate-300" />
            <p className="font-medium">Seleccioná un chat para comenzar</p>
          </div>
        ) : (
          <>
            {/* Header del Chat */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center gap-3">
              <Avatar className="h-10 w-10 shadow-sm">
                <AvatarImage src={selectedUser?.avatar_url} />
                <AvatarFallback>{selectedUser?.nombre?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">{selectedUser?.nombre} {selectedUser?.apellido}</h3>
                <p className="text-xs text-slate-500">Profesional Matriculado</p>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {loadingMsgs ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : (
                messages.map((msg, idx) => {
                  const isAdmin = msg.receiver_id !== null // Mensaje del admin tiene receiver != null
                  const showAvatar = idx === 0 || (messages[idx - 1].receiver_id !== null) !== isAdmin

                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="flex-shrink-0 w-8 h-8">
                        {showAvatar && (
                          <Avatar className="w-8 h-8 shadow-sm border border-slate-200">
                            <AvatarImage src={isAdmin ? "https://api.dicebear.com/7.x/initials/svg?seed=Admin" : selectedUser?.avatar_url} />
                            <AvatarFallback>{isAdmin ? "AD" : "PR"}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      <div className={`max-w-[75%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isAdmin 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}>
                          {msg.attachment_url && (
                            <div className="mb-2">
                              {msg.attachment_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                <img src={msg.attachment_url} alt="Adjunto" className="max-w-[200px] rounded-lg border border-black/10" />
                              ) : (
                                <a href={msg.attachment_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isAdmin ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                  <ImageIcon className="h-4 w-4" /> Ver adjunto
                                </a>
                              )}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex items-end gap-2 relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  className="hidden" 
                  accept="image/*,.pdf"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors flex-shrink-0"
                >
                  {uploadingFile ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribir respuesta..."
                    className="w-full resize-none bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all max-h-32"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="h-[46px] w-[46px] rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all disabled:opacity-50 flex-shrink-0 shadow-md"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -ml-0.5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
