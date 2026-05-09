import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Staff } from "@/hooks/use-auth"
import type { Role } from "@/hooks/use-auth"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, UserPlus, ShieldAlert, Coffee } from "lucide-react"
import { toast } from "sonner"

export function StaffManagement() {
  const { staffList, addStaff, deleteStaff, user: currentUser } = useAuth()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newRole, setNewRole] = useState<Role>("cashier")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")

  const handleAddAccount = async () => {
    if (!newName.trim()) return toast.error("Name is required")
    if (newPin.length < 4) return toast.error("PIN must be at least 4 digits")
    if (newPin !== confirmPin) return toast.error("PINs do not match")

    const result = await addStaff({
      name: newName.trim(),
      role: newRole,
      avatarColor: "bg-primary"
    }, newPin)

    if (result.success) {
      toast.success(result.message)
      setNewName("")
      setNewPin("")
      setConfirmPin("")
      setIsAddDialogOpen(false)
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = (staff: Staff) => {
    if (staff.id === currentUser?.id) {
      return toast.error("You cannot delete your own account")
    }
    if (window.confirm(`Are you sure you want to delete ${staff.name}?`)) {
      deleteStaff(staff.id)
      toast.success(`${staff.name} deleted`)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Staff Management</CardTitle>
          <CardDescription>Manage staff accounts and permissions</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
              <DialogDescription>
                Create a new staff member account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  placeholder="e.g. David" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={newRole} onValueChange={(value: Role) => setNewRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">PIN (4-6 digits)</label>
                <Input 
                  type="password" 
                  inputMode="numeric"
                  placeholder="••••" 
                  value={newPin} 
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Confirm PIN</label>
                <Input 
                  type="password" 
                  inputMode="numeric"
                  placeholder="••••" 
                  value={confirmPin} 
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAccount}>Save Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Shift Start</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {staff.avatarInitials}
                    </div>
                    {staff.name} {staff.id === currentUser?.id && "(You)"}
                  </div>
                </TableCell>
                <TableCell className="capitalize">
                  <div className="flex items-center gap-1">
                    {staff.role === 'admin' ? <ShieldAlert className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                    {staff.role}
                  </div>
                </TableCell>
                <TableCell>
                  {staff.shiftStart ? new Date(staff.shiftStart).toLocaleString() : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(staff)}
                    disabled={staff.id === currentUser?.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
