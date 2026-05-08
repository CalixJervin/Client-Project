import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, Users, UserPlus, ShieldAlert, Coffee } from "lucide-react";
import bcrypt from "bcryptjs"; // Requires the bcryptjs package we installed earlier

interface Staff {
  id: string;
  name: string;
  role: "barista" | "admin";
  avatarInitials: string;
}

export function AccountModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (o: boolean) => void }) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // New Account State
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"barista" | "admin">("barista");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // Load data every time the modal opens
  useEffect(() => {
    if (isOpen) {
      const savedStaff = localStorage.getItem("timpla_staff");
      if (savedStaff) setStaffList(JSON.parse(savedStaff));
      setCurrentUser(localStorage.getItem("currentUser"));
    }
  }, [isOpen]);

  // --- DELETE ACCOUNT ---
  const handleDelete = (id: string, name: string) => {
    // Prevent the user from deleting themselves while logged in
    if (id === currentUser) {
      toast.error("You cannot delete your own account while logged in.");
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete ${name}'s account?`)) {
      const updatedList = staffList.filter(s => s.id !== id);
      setStaffList(updatedList);
      
      // Update local storage
      localStorage.setItem("timpla_staff", JSON.stringify(updatedList));
      localStorage.removeItem(`${id}_pin`); // Delete their PIN securely
      localStorage.removeItem(`${id}_shift_start`); // Clear their logs
      
      toast.success(`${name} has been removed.`);
    }
  };

  // --- CREATE ACCOUNT ---
  const handleCreate = () => {
    if (!newName.trim()) return toast.error("Staff name is required.");
    if (newPin.length !== 4) return toast.error("PIN must be exactly 4 digits.");
    if (newPin !== confirmPin) return toast.error("PINs do not match.");

    // Generate unique ID and Initials
    const id = `${newRole}-${Date.now()}`;
    const avatarInitials = newName.trim().substring(0, 2).toUpperCase();

    const newStaff: Staff = { id, name: newName.trim(), role: newRole, avatarInitials };

    // Hash the PIN securely just like the login screen
    const salt = bcrypt.genSaltSync(10);
    const hashedPin = bcrypt.hashSync(newPin, salt);

    // Save to State and LocalStorage
    const updatedList = [...staffList, newStaff];
    setStaffList(updatedList);
    localStorage.setItem("timpla_staff", JSON.stringify(updatedList));
    localStorage.setItem(`${id}_pin`, hashedPin);

    toast.success(`${newStaff.name} created successfully!`);

    // Reset Form
    setNewName("");
    setNewPin("");
    setConfirmPin("");
    setNewRole("barista");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle>Staff Management</DialogTitle>
          <DialogDescription>Create new accounts or manage existing staff.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manage" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Manage
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Create New
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MANAGE EXISTING ACCOUNTS */}
          <TabsContent value="manage" className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
            {staffList.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between p-3 border rounded-xl bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {staff.avatarInitials}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{staff.name} {staff.id === currentUser && "(You)"}</span>
                    <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                      {staff.role === 'admin' ? <ShieldAlert className="h-3 w-3" /> : <Coffee className="h-3 w-3" />}
                      {staff.role}
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(staff.id, staff.name)}
                  disabled={staff.id === currentUser}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {staffList.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No staff found.</p>}
          </TabsContent>

          {/* TAB 2: CREATE NEW ACCOUNT */}
          <TabsContent value="create" className="space-y-4 mt-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Staff Name</label>
              <Input placeholder="e.g. Alex" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setNewRole("barista")}
                  className={`rounded-md ${newRole === "barista" ? "bg-background shadow-sm hover:bg-background" : "text-muted-foreground"}`}
                >
                  <Coffee className="h-4 w-4 mr-2" /> Barista
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setNewRole("admin")}
                  className={`rounded-md ${newRole === "admin" ? "bg-background shadow-sm hover:bg-background" : "text-muted-foreground"}`}
                >
                  <ShieldAlert className="h-4 w-4 mr-2" /> Admin
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">4-Digit PIN</label>
                <Input 
                  type="password" inputMode="numeric" maxLength={4} placeholder="••••" 
                  value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm PIN</label>
                <Input 
                  type="password" inputMode="numeric" maxLength={4} placeholder="••••" 
                  value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))} 
                />
              </div>
            </div>

            <Button className="w-full mt-2 h-12 text-md font-semibold" onClick={handleCreate}>
              <UserPlus className="mr-2 h-5 w-5" /> Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}