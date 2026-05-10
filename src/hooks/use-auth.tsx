import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react"
import bcrypt from "bcryptjs"
import { storage } from "@/lib/storage"

export type Role = "cashier" | "admin"

export interface Staff {
  id: string
  name: string
  role: Role
  avatarColor: string
  avatarInitials: string
  shiftStart?: string
}

interface AuthContextType {
  user: Staff | null
  staffList: Staff[]
  isLocked: boolean
  isInitialSetup: boolean
  login: (staffId: string, pin: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  lock: () => void
  unlock: (pin: string) => Promise<{ success: boolean; message: string }>
  addStaff: (staff: Omit<Staff, "id" | "avatarInitials">, pin: string) => Promise<{ success: boolean; message: string }>
  deleteStaff: (staffId: string) => void
  switchUser: () => void
  verifyMasterPIN: (pin: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MASTER_RECOVERY_PIN = "9999" // Hardcoded master recovery PIN
const SHIFT_DURATION_MS = 8 * 60 * 60 * 1000
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 1000

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Staff | null>(null)
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [isInitialSetup, setIsInitialSetup] = useState(false)
  
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load staff and session on mount
  useEffect(() => {
    const parsedStaff = storage.getStaff()
    setStaffList(parsedStaff)
    setIsInitialSetup(parsedStaff.length === 0)

    const currentUserId = storage.getItem("timpla_current_user_id", null)
    const sessionExpiry = storage.getItem("timpla_session_expiry", null)

    if (currentUserId && sessionExpiry && parseInt(sessionExpiry) > Date.now()) {
      const currentUser = parsedStaff.find((s: Staff) => s.id === currentUserId)
      if (currentUser) {
        setUser(currentUser)
        setIsLocked(storage.getItem<string>("timpla_is_locked", "false") === "true")
      }
    }
  }, [])

  const lock = useCallback(() => {
    setIsLocked(true)
    storage.setItem("timpla_is_locked", "true")
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (user && !isLocked) {
      inactivityTimerRef.current = setTimeout(() => {
        lock()
      }, INACTIVITY_TIMEOUT_MS)
    }
  }, [user, isLocked, lock])

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "mousemove"]
    const handleActivity = () => resetInactivityTimer()

    events.forEach(event => window.addEventListener(event, handleActivity))
    resetInactivityTimer()

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity))
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [resetInactivityTimer])

  const login = useCallback(async (staffId: string, pin: string): Promise<{ success: boolean; message: string }> => {
    const lockoutKey = `lockout_${staffId}`
    const attemptsKey = `attempts_${staffId}`
    const pinKey = `pin_${staffId}`

    const lockoutUntil = storage.getItem(lockoutKey, null)
    if (lockoutUntil && parseInt(lockoutUntil) > Date.now()) {
      return { success: false, message: "Account locked. Try again later." }
    }

    const hashedPin = storage.getItem(pinKey, null)
    const isMaster = pin === MASTER_RECOVERY_PIN

    const isPinValid = hashedPin ? await bcrypt.compare(pin, hashedPin) : false

    if (isPinValid || isMaster) {
      const staffMember = staffList.find(s => s.id === staffId)
      if (staffMember) {
        setUser(staffMember)
        setIsLocked(false)
        storage.setItem("timpla_current_user_id", staffId)
        storage.setItem("timpla_session_expiry", (Date.now() + SHIFT_DURATION_MS).toString())
        storage.setItem("timpla_is_locked", "false")
        storage.removeItem(attemptsKey)
        
        // Log shift start
        const shiftStart = new Date().toISOString()
        const updatedStaffList = staffList.map(s => s.id === staffId ? { ...s, shiftStart } : s)
        setStaffList(updatedStaffList)
        storage.saveStaff(updatedStaffList)

        return { success: true, message: `Welcome, ${staffMember.name}!` }
      }
    }

    // Failed attempt
    const attempts = parseInt(storage.getItem(attemptsKey, "0")) + 1
    if (attempts >= MAX_ATTEMPTS) {
      storage.setItem(lockoutKey, (Date.now() + LOCKOUT_DURATION_MS).toString())
      storage.setItem(attemptsKey, "0")
      return { success: false, message: "Too many failed attempts. Locked for 30s." }
    } else {
      storage.setItem(attemptsKey, attempts.toString())
      return { success: false, message: `Incorrect PIN. ${MAX_ATTEMPTS - attempts} attempts left.` }
    }
  }, [staffList])

  const unlock = useCallback(async (pin: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "No user session." }
    return login(user.id, pin)
  }, [user, login])

  const logout = useCallback(() => {
    setUser(null)
    setIsLocked(false)
    storage.removeItem("timpla_current_user_id")
    storage.removeItem("timpla_session_expiry")
    storage.removeItem("timpla_is_locked")
  }, [])

  const switchUser = useCallback(() => {
    lock()
    setUser(null)
    storage.removeItem("timpla_current_user_id")
    storage.removeItem("timpla_session_expiry")
  }, [lock])

  const addStaff = useCallback(async (staffData: Omit<Staff, "id" | "avatarInitials">, pin: string): Promise<{ success: boolean; message: string }> => {
    const isAdmin = staffData.role === "admin"
    const currentAdmins = staffList.filter(s => s.role === "admin").length

    if (isAdmin && currentAdmins >= 3) {
      return { success: false, message: "Maximum 3 admin accounts allowed." }
    }

    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const avatarInitials = staffData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    const newStaff: Staff = { ...staffData, id, avatarInitials }

    const salt = await bcrypt.genSalt(10)
    const hashedPin = await bcrypt.hash(pin, salt)

    const updatedStaffList = [...staffList, newStaff]
    setStaffList(updatedStaffList)
    storage.saveStaff(updatedStaffList)
    storage.setItem(`pin_${id}`, hashedPin)

    if (isInitialSetup) {
      setIsInitialSetup(false)
    }

    return { success: true, message: "Staff added successfully." }
  }, [staffList, isInitialSetup])

  const deleteStaff = useCallback((staffId: string) => {
    const updatedStaffList = staffList.filter(s => s.id !== staffId)
    setStaffList(updatedStaffList)
    storage.saveStaff(updatedStaffList)
    storage.removeItem(`pin_${staffId}`)
    
    if (updatedStaffList.length === 0) {
      setIsInitialSetup(true)
    }
  }, [staffList])

  const verifyMasterPIN = useCallback((pin: string) => pin === MASTER_RECOVERY_PIN, [])

  const contextValue = useMemo(() => ({ 
    user, 
    staffList, 
    isLocked, 
    isInitialSetup,
    login, 
    logout, 
    lock, 
    unlock, 
    addStaff, 
    deleteStaff,
    switchUser,
    verifyMasterPIN
  }), [user, staffList, isLocked, isInitialSetup, login, logout, lock, unlock, addStaff, deleteStaff, switchUser, verifyMasterPIN])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}


export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
