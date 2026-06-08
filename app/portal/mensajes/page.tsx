"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip, Loader2, Image as ImageIcon } from "lucide-react"
import { toast, Toaster } from "sonner"
import { supabase } from "@/lib/supabase"
import { getMessages, sendMessage } from "@/app/actions/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type Message = {
  id: string
  sender_id: string
  receiver_id: string | null
  content: string
  attachment_url: string | null
  created_at: string
  sender?: {
    nombre: string
    apellido: string
    avatar_url: string
  }
}

export default function UserChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        
        // Fetch profile
        const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
        setUserProfile(profile)

        // Fetch messages
        const msgs = await getMessages(user.id)
        setMessages(msgs as any)
        
        // Subscribe to real-time messages
        supabase
          .channel('public:messages')
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          }, (payload) => {
            setMessages((prev) => [...prev, payload.new as any])
          })
          .subscribe()
      }
      setLoading(false)
    }
    load()

    return () => { supabase.removeAllChannels() }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e?: React.FormEvent, attachmentUrl?: string) => {
    if (e) e.preventDefault()
    if (!input.trim() && !attachmentUrl) return
    if (!userId) return

    const currentInput = input
    setInput("")
    setSending(true)

    // Optimistic UI
    const tempMsg: Message = {
      id: crypto.randomUUID(),
      sender_id: userId,
      receiver_id: null,
      content: currentInput,
      attachment_url: attachmentUrl || null,
      created_at: new Date().toISOString(),
      sender: {
        nombre: userProfile?.nombre || 'Yo',
        apellido: userProfile?.apellido || '',
        avatar_url: userProfile?.avatar_url || ''
      }
    }
    setMessages((prev) => [...prev, tempMsg])

    const result = await sendMessage(userId, null, currentInput, attachmentUrl)
    
    if (!result.success) {
      toast.error("Error al enviar el mensaje")
      // Revert optimistic
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id))
      setInput(currentInput)
    }
    setSending(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploadingFile(true)
    const ext = file.name.split('.').pop()
    const fileName = `chat_${Date.now()}.${ext}`
    
    try {
      const { error } = await supabase.storage.from('attachments').upload(fileName, file)
      if (error) throw error
      
      const { data } = supabase.storage.from('attachments').getPublicUrl(fileName)
      await handleSend(undefined, data.publicUrl)
      toast.success("Archivo adjuntado correctamente")
    } catch (error) {
      toast.error("Error al subir el archivo")
    } finally {
      setUploadingFile(false)
    }
  }

  if (loading) {
    return <div className="flex h-[calc(100vh-140px)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1abc9c]" /></div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <Toaster richColors position="top-right" />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mesa de Entrada</h2>
          <p className="text-xs text-slate-500">Comunicate directamente con la Administración del COTOLAR.</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p className="text-sm">No hay mensajes. ¡Escribí para iniciar una consulta!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === userId
            const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="flex-shrink-0 w-8 h-8">
                  {showAvatar && (
                    <Avatar className="w-8 h-8 border border-slate-200 shadow-sm">
                      <AvatarImage src={isMe ? userProfile?.avatar_url : "https://api.dicebear.com/7.x/initials/svg?seed=Admin"} />
                      <AvatarFallback>{isMe ? "YO" : "AD"}</AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <span className="text-[10px] text-slate-400 mb-1 px-1">
                      {isMe ? "Yo" : "Administración"}
                    </span>
                  )}
                  
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-[#1abc9c] text-white rounded-br-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                  }`}>
                    {msg.attachment_url && (
                      <div className="mb-2">
                        {msg.attachment_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={msg.attachment_url} alt="Adjunto" className="max-w-[200px] rounded-lg border border-black/10" />
                        ) : (
                          <a href={msg.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/10 p-2 rounded-lg hover:bg-black/20 transition-colors">
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

      {/* Input Area */}
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
            className="p-3 text-slate-400 hover:text-[#0f3460] hover:bg-slate-50 rounded-full transition-colors flex-shrink-0"
          >
            {uploadingFile ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí un mensaje..."
              className="w-full resize-none bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm outline-none focus:border-[#1abc9c] focus:ring-2 focus:ring-[#1abc9c]/20 transition-all max-h-32"
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
            className="h-[46px] w-[46px] rounded-full bg-[#0f3460] hover:bg-[#0a2847] text-white flex items-center justify-center transition-all disabled:opacity-50 flex-shrink-0 shadow-md"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  )
}
