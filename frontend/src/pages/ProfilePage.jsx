import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api/users.api";
import { extractErrorMessage } from "../api/axiosClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import AddressCard from "../features/profile/AddressCard";
import AddressFormPanel from "../features/profile/AddressFormPanel";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyAddressId, setBusyAddressId] = useState(null);

  useEffect(() => {
    usersApi
      .listAddresses()
      .then(setAddresses)
      .finally(() => setLoadingAddresses(false));
  }, []);

  async function handleSaveName(e) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setSavingName(true);
    try {
      const updated = await usersApi.updateMe({ name: name.trim() });
      setUser((u) => ({ ...u, name: updated.name }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update profile"));
    } finally {
      setSavingName(false);
    }
  }

  function validatePasswordForm() {
    const next = {};
    if (!pwForm.currentPassword) next.currentPassword = "Required";
    if (pwForm.newPassword.length < 8 || !/[A-Za-z]/.test(pwForm.newPassword) || !/[0-9]/.test(pwForm.newPassword)) {
      next.newPassword = "8+ characters with a letter and a number";
    }
    if (pwForm.confirmPassword !== pwForm.newPassword) next.confirmPassword = "Passwords do not match";
    setPwErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    setSavingPw(true);
    try {
      await usersApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not change password"));
    } finally {
      setSavingPw(false);
    }
  }

  async function handleCreateAddress(value) {
    try {
      const created = await usersApi.createAddress(value);
      setAddresses((prev) => [created, ...prev.map((a) => (value.isDefault ? { ...a, isDefault: false } : a))]);
      setAddingAddress(false);
      toast.success("Address added");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not add address"));
    }
  }

  async function handleUpdateAddress(id, value) {
    try {
      const updated = await usersApi.updateAddress(id, value);
      setAddresses((prev) =>
        prev.map((a) => (a.id === id ? updated : value.isDefault ? { ...a, isDefault: false } : a))
      );
      setEditingId(null);
      toast.success("Address updated");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update address"));
    }
  }

  async function handleSetDefault(address) {
    setBusyAddressId(address.id);
    try {
      await usersApi.updateAddress(address.id, { isDefault: true });
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === address.id })));
      toast.success("Default address updated");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update default address"));
    } finally {
      setBusyAddressId(null);
    }
  }

  async function handleDeleteAddress(address) {
    setBusyAddressId(address.id);
    try {
      await usersApi.removeAddress(address.id);
      setAddresses((prev) => prev.filter((a) => a.id !== address.id));
      toast.success("Address deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not delete address"));
    } finally {
      setBusyAddressId(null);
    }
  }

  if (!user) return <Spinner className="min-h-[60vh]" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Profile</h1>

      <div className="mt-6 flex flex-col gap-6">
        {/* Profile info */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800">Account Details</h2>
          <form onSubmit={handleSaveName} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} className="sm:max-w-xs" />
            <Button type="submit" loading={savingName} size="md">
              Save
            </Button>
          </form>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd className="text-slate-700">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Username</dt>
              <dd className="text-slate-700">{user.username}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Role</dt>
              <dd className="capitalize text-slate-700">{user.role}</dd>
            </div>
          </dl>
        </section>

        {/* Change password */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800">Change Password</h2>
          <form onSubmit={handleChangePassword} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              type="password"
              label="Current password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
              error={pwErrors.currentPassword}
            />
            <Input
              type="password"
              label="New password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
              error={pwErrors.newPassword}
            />
            <Input
              type="password"
              label="Confirm new password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              error={pwErrors.confirmPassword}
            />
            <Button type="submit" loading={savingPw} className="sm:col-span-3 sm:w-fit">
              Update password
            </Button>
          </form>
        </section>

        {/* Addresses */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Shipping Addresses</h2>
            {!addingAddress && (
              <button
                onClick={() => setAddingAddress(true)}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                + Add address
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {loadingAddresses ? (
              <Spinner />
            ) : (
              <>
                {addresses.map((addr) =>
                  editingId === addr.id ? (
                    <AddressFormPanel
                      key={addr.id}
                      initialValue={addr}
                      submitLabel="Save changes"
                      onSubmit={(val) => handleUpdateAddress(addr.id, val)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      busy={busyAddressId === addr.id}
                      onEdit={(a) => setEditingId(a.id)}
                      onDelete={handleDeleteAddress}
                      onSetDefault={handleSetDefault}
                    />
                  )
                )}

                {addingAddress && (
                  <AddressFormPanel onSubmit={handleCreateAddress} onCancel={() => setAddingAddress(false)} />
                )}

                {!loadingAddresses && addresses.length === 0 && !addingAddress && (
                  <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
                    No saved addresses yet. Add one to speed up checkout.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
