import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ShieldAlert, Coffee, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import bcrypt from "bcryptjs";

interface Staff {
  id: string
  name: string
  role: "barista" | "admin"
  avatarInitials: string
}

export function AccountModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (o: boolean) => void }) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [view, setView] = useState<"list" | "add" | "change-pin">("list");
  
  // States for Add
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"barista" | "admin">("barista");
  const [newPin, setNewPin] = useState("");

  // States for Change PIN
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [currentPin, setCurrentPin] = useState("");
  const [updatedPin, setUpdatedPin] = useState("");

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("timpla_staff");
      if (saved) setStaffList(JSON.parse(saved));
      setView("list");
    }
  }, [isOpen]);

  const handleDelete = (id: string, name: string) => {
    if (id === localStorage.getItem("currentUser")) {
      return toast.error("You cannot delete your own account while logged in.");
    }
    if (window.confirm(`Permanently delete ${name}?`)) {
      const updated = staffList.filter(s => s.id !== id);
      setStaffList(updated);
      localStorage.setItem("timpla_staff", JSON.stringify(updated));
      localStorage.removeItem(`${id}_pin`);
      toast.success(`${name} deleted.`);
    }
  };

  const handleAddAccount = () => {
    if (!newName.trim()) return toast.error("Name required");
    if (newPin.length !== 4) return toast.error("PIN must be 4 digits");

    const newId = `${newRole}-${Date.now()}`;
    const newAccount: Staff = { id: newId, name: newName.trim(), role: newRole, avatarInitials: newName.substring(0, 2).toUpperCase() };
    
    const updated = [...staffList, newAccount];
    setStaffList(updated);
    localStorage.setItem("timpla_staff", JSON.stringify(updated));
    localStorage.setItem(`${newId}_pin`, bcrypt.hashSync(newPin, bcrypt.genSaltSync(10)));
    
    toast.success(`${newName} added!`);
    setNewName(""); setNewPin(""); setView("list");
  };

  const handleChangePin = () => {
    if (!selectedStaff) return;
    if (updatedPin.length !== 4) return toast.error("New PIN must be 4 digits");

    const savedHash = localStorage.getItem(`${selectedStaff.id}_pin`);
    if (!savedHash || !bcrypt.compareSync(currentPin, savedHash)) {
      return toast.error("Current PIN is incorrect.");
    }

    localStorage.setItem(`${selectedStaff.id}_pin`, bcrypt.hashSync(updatedPin, bcrypt.genSaltSync(10)));
    toast.success("PIN updated securely!");
    
    setCurrentPin(""); setUpdatedPin(""); setSelectedStaff(null); setView("list");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Management</DialogTitle>
          <DialogDescription>Manage POS access and security PINs.</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {/* VIEW: LIST STAFF */}
          {view === "list" && (
            <div className="flex flex-col gap-4">
              <Button onClick={() => setView("add")} className="w-full bg-foreground text-background hover:bg-foreground/90">
                <Plus className="mr-2 h-4 w-4" /> Add New Staff
              </Button>
              <div className="flex flex-col gap-2 mt-2">
                {staffList.map(staff => (
                  <div key={staff.id} className="flex items-center justify-between p-3 rounded-lg border bg-card shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {staff.avatarInitials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{staff.name}</span>
                        <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                          {staff.role === 'admin' ? <ShieldAlert className="h-3 w-3" /> : <Coffee className="h-3 w-3" />} {staff.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedStaff(staff); setView("change-pin"); }}>
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(staff.id, staff.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: ADD STAFF */}
          {view === "add" && (
            <div className="flex flex-col gap-4">
              <Button variant="ghost" className="w-fit -ml-4" onClick={() => setView("list")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team
              </Button>
              <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input value={newName} onChange={e => setNewName(e.target.value)} /></div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                  <Button variant="ghost" onClick={() => setNewRole("barista")} className={`rounded-md ${newRole === "barista" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Cashier</Button>
                  <Button variant="ghost" onClick={() => setNewRole("admin")} className={`rounded-md ${newRole === "admin" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Admin</Button>
                </div>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">4-Digit PIN</label><Input type="password" inputMode="numeric" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} /></div>
              <Button className="mt-2" onClick={handleAddAccount}>Save Account</Button>
            </div>
          )}

          {/* VIEW: CHANGE PIN */}
          {view === "change-pin" && selectedStaff && (
            <div className="flex flex-col gap-4">
              <Button variant="ghost" className="w-fit -ml-4" onClick={() => { setView("list"); setCurrentPin(""); setUpdatedPin(""); }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Team
              </Button>
              <h3 className="font-semibold text-lg border-b pb-2">Change PIN for {selectedStaff.name}</h3>
              <div className="space-y-2"><label className="text-sm font-medium">Current PIN</label><Input type="password" inputMode="numeric" maxLength={4} value={currentPin} onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">New 4-Digit PIN</label><Input type="password" inputMode="numeric" maxLength={4} value={updatedPin} onChange={e => setUpdatedPin(e.target.value.replace(/\D/g, ''))} /></div>
              <Button className="mt-2" onClick={handleChangePin}>Update Security PIN</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}