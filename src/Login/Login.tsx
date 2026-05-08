import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Delete, ArrowLeft, ShieldAlert, Coffee, Clock, UserPlus, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toaster, toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import bcrypt from "bcryptjs"

interface Staff {
  id: string
  name: string
  role: "barista" | "admin"
  avatarInitials: string
}

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 1000 
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000 
const SHIFT_DURATION_MS = 8 * 60 * 60 * 1000 

export default function LoginPage() {
  const navigate = useNavigate()
  
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [view, setView] = useState<"select" | "pin" | "add">("select")
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isManaging, setIsManaging] = useState(false)
  
  const [pin, setPin] = useState("")
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)

  // Add Account State
  const [newName, setNewName] = useState("")
  const [newRole, setNewRole] = useState<"barista" | "admin">("barista")
  const [newPin, setNewPin] = useState("")

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedStaff = localStorage.getItem("timpla_staff")
    if (!savedStaff) {
      const defaultStaff: Staff[] = [
        { id: "admin-1", name: "Maria", role: "admin", avatarInitials: "MA" },
        { id: "barista-1", name: "David", role: "barista", avatarInitials: "DA" }
      ]
      localStorage.setItem("timpla_staff", JSON.stringify(defaultStaff))
      
      const salt = bcrypt.genSaltSync(10)
      localStorage.setItem("admin-1_pin", bcrypt.hashSync("1234", salt))
      localStorage.setItem("barista-1_pin", bcrypt.hashSync("1111", salt))
      
      setStaffList(defaultStaff)
    } else {
      setStaffList(JSON.parse(savedStaff))
    }

    const savedLockout = localStorage.getItem("timpla_lockout")
    if (savedLockout && parseInt(savedLockout) > Date.now()) {
      setLockoutUntil(parseInt(savedLockout))
    }
  }, [])

  // --- LOGIN & KEYBOARD LOGIC ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== "pin" || lockoutUntil) return
      if (e.key >= "0" && e.key <= "9") handleKeyPress(e.key)
      else if (e.key === "Backspace") handleDelete()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [view, pin, lockoutUntil])

  const handleKeyPress = (num: string) => {
    if (pin.length < 4 && !lockoutUntil) {
      const newPinValue = pin + num;
      setPin(newPinValue);
      if (newPinValue.length === 4 && selectedStaff) verifyPin(newPinValue, selectedStaff);
    }
  }

  const handleDelete = () => setPin(prev => prev.slice(0, -1))

  const verifyPin = (enteredPin: string, staff: Staff) => {
    const hashedPin = localStorage.getItem(`${staff.id}_pin`)
    if (hashedPin && bcrypt.compareSync(enteredPin, hashedPin)) {
      localStorage.setItem("currentUser", staff.id)
      localStorage.setItem("timpla_session_expiry", (Date.now() + SHIFT_DURATION_MS).toString())
      setFailedAttempts(0)
      
      const shiftStartKey = `${staff.id}_shift_start`
      if (!localStorage.getItem(shiftStartKey)) {
        const startTime = new Date().toLocaleString()
        localStorage.setItem(shiftStartKey, startTime)
        toast.success(`Shift started for ${staff.name}`)
      } else {
        toast.success(`Welcome back, ${staff.name}!`)
      }
      setTimeout(() => navigate("/"), 300)
    } else {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)
      setPin("")
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION_MS
        setLockoutUntil(lockoutTime)
        localStorage.setItem("timpla_lockout", lockoutTime.toString())
        toast.error(`Locked for 30 seconds.`)
      } else {
        toast.error(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts left.`)
      }
    }
  }

  // --- ACCOUNT MANAGEMENT ---
  const handleCreateAccount = () => {
    if (!newName.trim()) return toast.error("Name is required")
    if (newPin.length !== 4) return toast.error("PIN must be 4 digits")

    const newId = `${newRole}-${Date.now()}`
    const initials = newName.substring(0, 2).toUpperCase()
    const newAccount: Staff = { id: newId, name: newName.trim(), role: newRole, avatarInitials: initials }
    
    const updatedStaff = [...staffList, newAccount]
    localStorage.setItem("timpla_staff", JSON.stringify(updatedStaff))
    
    const salt = bcrypt.genSaltSync(10)
    localStorage.setItem(`${newId}_pin`, bcrypt.hashSync(newPin, salt))
    
    setStaffList(updatedStaff)
    toast.success(`${newName} added successfully!`)
    
    setNewName("")
    setNewPin("")
    setView("select")
  }

  const handleDeleteAccount = (staffId: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to delete ${staffName}?`)) {
      const updatedStaff = staffList.filter(s => s.id !== staffId)
      localStorage.setItem("timpla_staff", JSON.stringify(updatedStaff))
      localStorage.removeItem(`${staffId}_pin`)
      setStaffList(updatedStaff)
      toast.success(`${staffName} deleted.`)
      if (updatedStaff.length === 0) setIsManaging(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 selection:bg-transparent">
      <div className="w-full max-w-2xl bg-background rounded-3xl shadow-2xl overflow-hidden border">
        
        <div className="bg-primary/5 p-6 flex items-center justify-between border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Timpla Cafe</h1>
            <p className="text-sm text-muted-foreground">Point of Sale System</p>
          </div>
          <Clock className="h-6 w-6 text-muted-foreground opacity-50" />
        </div>

        <div className="p-8 relative min-h-[480px] flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: STAFF SELECTION */}
            {view === "select" && (
              <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Who is working right now?</h2>
                  {staffList.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setIsManaging(!isManaging)} className={isManaging ? "text-destructive" : ""}>
                      {isManaging ? "Done" : <Settings className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-fr">
                  {staffList.map((staff) => (
                    <div key={staff.id} className="relative">
                      <button 
                        onClick={() => {
                          if (isManaging) handleDeleteAccount(staff.id, staff.name)
                          else { setSelectedStaff(staff); setView("pin"); }
                        }}
                        className={`w-full flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all active:scale-95 ${isManaging ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10 animate-pulse" : "border-transparent bg-muted/50 hover:bg-muted hover:border-primary/20 shadow-sm"}`}
                      >
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold shadow-sm ${isManaging ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"}`}>
                          {isManaging ? <Trash2 className="h-6 w-6" /> : staff.avatarInitials}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-lg">{staff.name}</p>
                          <p className="text-xs text-muted-foreground capitalize flex items-center justify-center gap-1 mt-1">
                            {staff.role === 'admin' ? <ShieldAlert className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                            {staff.role}
                          </p>
                        </div>
                      </button>
                    </div>
                  ))}

                  {/* Add Account Button in Grid */}
                  {!isManaging && (
                    <button 
                      onClick={() => setView("add")}
                      className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-all active:scale-95 text-muted-foreground hover:text-primary"
                    >
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl shadow-sm">
                        <UserPlus className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-lg">Add Account</p>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW 2: PIN PAD */}
            {view === "pin" && selectedStaff && (
              <motion.div key="pin-pad" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center flex-1 max-w-sm mx-auto w-full">
                <div className="w-full flex items-center justify-between mb-8">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => { setView("select"); setPin(""); }}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="text-center">
                    <span className="font-semibold text-xl">Hi, {selectedStaff.name} 👋</span>
                    <p className="text-sm text-muted-foreground">Enter your PIN</p>
                  </div>
                  <div className="w-10" />
                </div>

                {lockoutUntil ? (
                  <div className="mb-8 p-3 bg-destructive/10 text-destructive rounded-lg text-sm font-medium animate-pulse text-center w-full">
                    Account locked. Please wait 30 seconds.
                  </div>
                ) : (
                  <div className="flex gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-4 w-4 rounded-full transition-all duration-200 ${i < pin.length ? "bg-primary scale-110 shadow-sm" : "bg-muted-foreground/20"}`} />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 w-full mt-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button key={num} variant="outline" disabled={!!lockoutUntil} onClick={() => handleKeyPress(num.toString())} className="h-20 text-3xl font-medium rounded-2xl bg-background hover:bg-muted/50 border-muted-foreground/10 shadow-sm active:scale-95 transition-all">
                      {num}
                    </Button>
                  ))}
                  <div />
                  <Button variant="outline" disabled={!!lockoutUntil} onClick={() => handleKeyPress("0")} className="h-20 text-3xl font-medium rounded-2xl bg-background hover:bg-muted/50 border-muted-foreground/10 shadow-sm active:scale-95 transition-all">
                    0
                  </Button>
                  <Button variant="ghost" disabled={pin.length === 0 || !!lockoutUntil} onClick={handleDelete} className="h-20 rounded-2xl hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all">
                    <Delete className="h-8 w-8" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: ADD NEW ACCOUNT */}
            {view === "add" && (
              <motion.div key="add-account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col flex-1 max-w-sm mx-auto w-full">
                <div className="w-full flex items-center justify-between mb-8">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { setView("select"); setNewName(""); setNewPin(""); }}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <span className="font-semibold text-xl">New Account</span>
                  <div className="w-10" />
                </div>

                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Staff Name</label>
                    <Input placeholder="e.g. Alex" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-12 text-lg" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                      <Button variant="ghost" onClick={() => setNewRole("barista")} className={`rounded-md ${newRole === "barista" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Cashier</Button>
                      <Button variant="ghost" onClick={() => setNewRole("admin")} className={`rounded-md ${newRole === "admin" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Admin</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Create 4-Digit PIN</label>
                    <Input type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))} className="h-12 text-lg tracking-widest text-center" />
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <Button className="w-full h-14 text-lg rounded-xl shadow-md" onClick={handleCreateAccount}>
                    Save Account
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      <Toaster richColors />
    </div>
  )
}