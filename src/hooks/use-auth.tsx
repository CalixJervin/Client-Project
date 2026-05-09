import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import bcrypt from "bcryptjs"

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
    const savedStaff = localStorage.getItem("timpla_staff")
    if (savedStaff) {
      const parsedStaff = JSON.parse(savedStaff)
      setStaffList(parsedStaff)
      setIsInitialSetup(parsedStaff.length === 0)
    } else {
      setIsInitialSetup(true)
    }

    const currentUserId = localStorage.getItem("timpla_current_user_id")
    const sessionExpiry = localStorage.getItem("timpla_session_expiry")

    if (currentUserId && sessionExpiry && parseInt(sessionExpiry) > Date.now()) {
      const savedStaffData = localStorage.getItem("timpla_staff")
      if (savedStaffData) {
        const staff: Staff[] = JSON.parse(savedStaffData)
        const currentUser = staff.find(s => s.id === currentUserId)
        if (currentUser) {
          setUser(currentUser)
          setIsLocked(localStorage.getItem("timpla_is_locked") === "true")
        }
      }
    }
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (user && !isLocked) {
      inactivityTimerRef.current = setTimeout(() => {
        lock()
      }, INACTIVITY_TIMEOUT_MS)
    }
  }, [user, isLocked])

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

  const login = async (staffId: string, pin: string): Promise<{ success: boolean; message: string }> => {
    const lockoutKey = `lockout_${staffId}`
    const attemptsKey = `attempts_${staffId}`
    const pinKey = `pin_${staffId}`

    const lockoutUntil = localStorage.getItem(lockoutKey)
    if (lockoutUntil && parseInt(lockoutUntil) > Date.now()) {
      return { success: false, message: "Account locked. Try again later." }
    }

    const hashedPin = localStorage.getItem(pinKey)
    const isMaster = pin === MASTER_RECOVERY_PIN

    if ((hashedPin && bcrypt.compareSync(pin, hashedPin)) || isMaster) {
      const staffMember = staffList.find(s => s.id === staffId)
      if (staffMember) {
        setUser(staffMember)
        setIsLocked(false)
        localStorage.setItem("timpla_current_user_id", staffId)
        localStorage.setItem("timpla_session_expiry", (Date.now() + SHIFT_DURATION_MS).toString())
        localStorage.setItem("timpla_is_locked", "false")
        localStorage.removeItem(attemptsKey)
        
        // Log shift start
        const shiftStart = new Date().toISOString()
        const updatedStaffList = staffList.map(s => s.id === staffId ? { ...s, shiftStart } : s)
        setStaffList(updatedStaffList)
        localStorage.setItem("timpla_staff", JSON.stringify(updatedStaffList))

        return { success: true, message: `Welcome, ${staffMember.name}!` }
      }
    }

    // Failed attempt
    const attempts = parseInt(localStorage.getItem(attemptsKey) || "0") + 1
    if (attempts >= MAX_ATTEMPTS) {
      localStorage.setItem(lockoutKey, (Date.now() + LOCKOUT_DURATION_MS).toString())
      localStorage.setItem(attemptsKey, "0")
      return { success: false, message: "Too many failed attempts. Locked for 30s." }
    } else {
      localStorage.setItem(attemptsKey, attempts.toString())
      return { success: false, message: `Incorrect PIN. ${MAX_ATTEMPTS - attempts} attempts left.` }
    }
  }

  const unlock = async (pin: string): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: "No user session." }
    return login(user.id, pin)
  }

  const lock = () => {
    setIsLocked(true)
    localStorage.setItem("timpla_is_locked", "true")
  }

  const logout = () => {
    setUser(null)
    setIsLocked(false)
    localStorage.removeItem("timpla_current_user_id")
    localStorage.removeItem("timpla_session_expiry")
    localStorage.removeItem("timpla_is_locked")
  }

  const switchUser = () => {
    lock()
    setUser(null)
    localStorage.removeItem("timpla_current_user_id")
    localStorage.removeItem("timpla_session_expiry")
  }

  const addStaff = async (staffData: Omit<Staff, "id" | "avatarInitials">, pin: string): Promise<{ success: boolean; message: string }> => {
    const isAdmin = staffData.role === "admin"
    const currentAdmins = staffList.filter(s => s.role === "admin").length

    if (isAdmin && currentAdmins >= 3) {
      return { success: false, message: "Maximum 3 admin accounts allowed." }
    }

    const id = crypto.randomUUID()
    const avatarInitials = staffData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    const newStaff: Staff = { ...staffData, id, avatarInitials }

    const salt = bcrypt.genSaltSync(10)
    const hashedPin = bcrypt.hashSync(pin, salt)

    const updatedStaffList = [...staffList, newStaff]
    setStaffList(updatedStaffList)
    localStorage.setItem("timpla_staff", JSON.stringify(updatedStaffList))
    localStorage.setItem(`pin_${id}`, hashedPin)

    if (isInitialSetup) {
      setIsInitialSetup(false)
    }

    return { success: true, message: "Staff added successfully." }
  }

  const deleteStaff = (staffId: string) => {
    const updatedStaffList = staffList.filter(s => s.id !== staffId)
    setStaffList(updatedStaffList)
    localStorage.setItem("timpla_staff", JSON.stringify(updatedStaffList))
    localStorage.removeItem(`pin_${staffId}`)
    
    if (updatedStaffList.length === 0) {
      setIsInitialSetup(true)
    }
  }

  const verifyMasterPIN = (pin: string) => pin === MASTER_RECOVERY_PIN

  return (
    <AuthContext.Provider value={{ 
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
    }}>
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
