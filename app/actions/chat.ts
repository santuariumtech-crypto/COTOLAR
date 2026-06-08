"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Obtener mensajes de un chat específico
export async function getMessages(userId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:user_profiles!sender_id(nombre, apellido, avatar_url)")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId},receiver_id.is.null`)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }
  // Filtrar en memoria para asegurar que sean los de este chat
  return data.filter(m => 
    (m.sender_id === userId && m.receiver_id === null) || 
    m.receiver_id === userId ||
    (m.sender_id === userId && m.receiver_id !== null)
  )
}

export async function sendMessage(senderId: string, receiverId: string | null, content: string, attachmentUrl?: string) {
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      attachment_url: attachmentUrl
    })
    .select()
    .single()

  if (error) {
    console.error("Error sending message:", error)
    return { success: false, error: error.message }
  }

  // Notificar al receptor
  if (receiverId) {
    await supabase.from("notifications").insert({
      user_id: receiverId,
      title: "Nuevo Mensaje",
      message: "Tenés un nuevo mensaje de la Administración.",
      link: "/portal/mensajes"
    })
  }

  revalidatePath("/portal/mensajes")
  revalidatePath("/admin/inbox")
  
  return { success: true, message }
}

export async function getAdminChats() {
  // Obtenemos todos los mensajes ordenados por fecha
  const { data: msgs, error } = await supabase
    .from("messages")
    .select("*, sender:user_profiles!sender_id(id, nombre, apellido, avatar_url), receiver:user_profiles!receiver_id(id, nombre, apellido, avatar_url)")
    .order("created_at", { ascending: false })

  if (error || !msgs) return []

  // Agrupar por usuario (el que no es admin/null)
  const usersMap = new Map()

  for (const m of msgs) {
    let userId = null
    let userProfile = null

    if (m.receiver_id === null) {
      // Mensaje hacia el admin, el sender es el usuario
      userId = m.sender_id
      userProfile = m.sender
    } else {
      // Mensaje del admin al usuario
      userId = m.receiver_id
      userProfile = m.receiver
    }

    if (userId && !usersMap.has(userId)) {
      usersMap.set(userId, {
        id: userId,
        nombre: userProfile?.nombre,
        apellido: userProfile?.apellido,
        avatar_url: userProfile?.avatar_url,
        lastMessage: m.content,
        lastMessageDate: m.created_at,
        isRead: m.is_read || m.sender_id === userId ? m.is_read : true
      })
    }
  }

  return Array.from(usersMap.values())
}
