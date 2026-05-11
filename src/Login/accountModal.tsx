import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Trash2, Plus, ShieldAlert, Coffee, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { useAuth, type Staff } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function AccountModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (o: boolean) => void }) {
  const { staffList, user, addStaff, deleteStaff } = useAuth();
  const [view, setView] = useState<"list" | "add" | "change-pin">("list");
  
  // States for Add
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"cashier" | "admin">("cashier");
  const [newPin, setNewPin] = useState("");

  // States for Deletion
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<{id: string, name: string} | null>(null);

  // States for Change PIN
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [currentPin, setCurrentPin] = useState("");
  const [updatedPin, setUpdatedPin] = useState("");

  useEffect(() => {
    if (isOpen) {
      setView("list");
    }
  }, [isOpen]);

  const handleDelete = (id: string, name: string) => {
    if (id === user?.id) {
      return toast.error("You cannot delete your own account while logged in.");
    }
    setStaffToDelete({ id, name });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    try {
      await deleteStaff(staffToDelete.id);
      toast.success(`${staffToDelete.name} deleted.`);
      setIsDeleteConfirmOpen(false);
      setStaffToDelete(null);
    } catch (error) {
      toast.error("Failed to delete staff member");
    }
  };

  const handleAddAccount = async () => {
    if (!newName.trim()) return toast.error("Name required");
    if (newPin.length < 4) return toast.error("PIN must be at least 4 digits");

    const result = await addStaff({
      name: newName.trim(),
      role: newRole,
      avatarColor: "bg-primary"
    }, newPin);
    
    if (result.success) {
      toast.success(`${newName} added!`);
      setNewName(""); setNewPin(""); setView("list");
    } else {
      toast.error(result.message);
    }
  };

  const handleChangePin = async () => {
    if (!selectedStaff) return;
    if (updatedPin.length < 4) return toast.error("New PIN must be at least 4 digits");

    const { data: staffData, error } = await supabase
      .from('staff')
      .select('pin_hash')
      .eq('id', selectedStaff.id)
      .single();

    if (error || !staffData) {
      return toast.error("Staff member not found.");
    }

    if (!bcrypt.compareSync(currentPin, staffData.pin_hash)) {
      return toast.error("Current PIN is incorrect.");
    }

    const salt = await bcrypt.genSalt(10);
    const pin_hash = await bcrypt.hash(updatedPin, salt);

    const { error: updateError } = await supabase
      .from('staff')
      .update({ pin_hash })
      .eq('id', selectedStaff.id);

    if (updateError) {
      toast.error("Failed to update PIN");
    } else {
      toast.success("PIN updated securely!");
      setCurrentPin(""); setUpdatedPin(""); setSelectedStaff(null); setView("list");
    }
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
                  <Button variant="ghost" onClick={() => setNewRole("cashier")} className={`rounded-md ${newRole === "cashier" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Cashier</Button>
                  <Button variant="ghost" onClick={() => setNewRole("admin")} className={`rounded-md ${newRole === "admin" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Admin</Button>
                </div>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">PIN (4-6 digits)</label><Input type="password" inputMode="numeric" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} /></div>
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
              <div className="space-y-2"><label className="text-sm font-medium">Current PIN</label><Input type="password" inputMode="numeric" value={currentPin} onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">New PIN (4-6 digits)</label><Input type="password" inputMode="numeric" value={updatedPin} onChange={e => setUpdatedPin(e.target.value.replace(/\D/g, ''))} /></div>
              <Button className="mt-2" onClick={handleChangePin}>Update Security PIN</Button>
            </div>
          )}
        </div>
      </DialogContent>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="py-4">
              Are you sure you want to permanently delete <strong>{staffToDelete?.name}</strong>? This will revoke their access to the POS.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="flex-1">Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
