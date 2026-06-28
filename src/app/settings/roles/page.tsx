"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { config } from "@/src/libs/utils/config";
import { gooeyToast } from "goey-toast";
import {
  UserPlusIcon,
  TrashIcon,
  PlusIcon,
  KeyIcon,
  LockClosedIcon,
  CheckIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

interface AdminUser {
  _id: string;
  username: string;
  email?: string;
  role: string;
}

const MODULES = [
  { key: "dashboard", name: "Dashboard" },
  { key: "orders", name: "Orders" },
  { key: "products", name: "Products" },
  { key: "vendors", name: "Vendors" },
  { key: "users", name: "Users & Customers" },
  { key: "drivers", name: "Delivery Partners" },
  { key: "operations", name: "Operations Slots" },
  { key: "payments", name: "Payments & Settlements" },
  { key: "marketing", name: "Marketing Banners" },
  { key: "media", name: "Media Gallery" },
  { key: "reports", name: "Reports" },
  { key: "settings", name: "General Settings" },
];

const ACTIONS = ["read", "create", "update", "delete"];

export default function RolesAndAdminsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Modals & Forms
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("support");

  const [newRoleName, setNewRoleName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = config.backend_url;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rolesRes, adminsRes] = await Promise.all([
        axios.get(`${backendUrl}/admin/roles`),
        axios.get(`${backendUrl}/admin/users`)
      ]);
      setRoles(rolesRes.data);
      setAdmins(adminsRes.data);
      
      // Select the first non-superadmin role by default if available
      const nonSuper = rolesRes.data.find((r: Role) => r.name !== "superadmin");
      if (nonSuper) {
        setSelectedRole(nonSuper);
      } else if (rolesRes.data.length > 0) {
        setSelectedRole(rolesRes.data[0]);
      }
    } catch (err: any) {
      gooeyToast.error(err.response?.data?.message || "Failed to load roles and administrators.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // --- Role Management Handlers ---
  // ==========================================

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const formattedName = newRoleName.trim().toLowerCase();
    if (["superadmin", "support", "manager"].includes(formattedName)) {
      gooeyToast.error("Standard roles already exist or name is reserved.");
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/admin/roles`, {
        name: formattedName,
        permissions: []
      });
      setRoles([...roles, res.data]);
      setSelectedRole(res.data);
      setNewRoleName("");
      gooeyToast.success(`Role '${formattedName}' created successfully.`);
    } catch (err: any) {
      gooeyToast.error(err.response?.data?.message || "Failed to create role.");
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role '${roleName}'?`)) return;

    try {
      await axios.delete(`${backendUrl}/admin/roles/${roleId}`);
      setRoles(roles.filter(r => r._id !== roleId));
      if (selectedRole?._id === roleId) {
        const nextRole = roles.find(r => r._id !== roleId);
        setSelectedRole(nextRole || null);
      }
      gooeyToast.success(`Role '${roleName}' deleted successfully.`);
    } catch (err: any) {
      gooeyToast.error(err.response?.data?.message || "Failed to delete role.");
    }
  };

  const handlePermissionToggle = async (moduleKey: string, action: string) => {
    if (!selectedRole || selectedRole.name === "superadmin") return;

    const permString = `${moduleKey}:${action}`;
    let newPermissions = [...selectedRole.permissions];

    if (newPermissions.includes(permString)) {
      newPermissions = newPermissions.filter(p => p !== permString);
    } else {
      newPermissions.push(permString);
    }

    try {
      const res = await axios.put(`${backendUrl}/admin/roles/${selectedRole._id}`, {
        permissions: newPermissions
      });

      // Update local state
      setRoles(roles.map(r => r._id === selectedRole._id ? res.data : r));
      setSelectedRole(res.data);
      gooeyToast.success("Permissions updated.");
    } catch (err: any) {
      gooeyToast.error(err.response?.data?.message || "Failed to save permissions.");
    }
  };

  const handleToggleAllPermissions = async (grantAll: boolean) => {
    if (!selectedRole || selectedRole.name === "superadmin") return;

    let newPermissions: string[] = [];
    if (grantAll) {
      MODULES.forEach(m => {
        ACTIONS.forEach(a => {
          newPermissions.push(`${m.key}:${a}`);
        });
      });
    }

    try {
      const res = await axios.put(`${backendUrl}/admin/roles/${selectedRole._id}`, {
        permissions: newPermissions
      });
      setRoles(roles.map(r => r._id === selectedRole._id ? res.data : r));
      setSelectedRole(res.data);
      gooeyToast.success(grantAll ? "Granted all permissions." : "Revoked all permissions.");
    } catch (err: any) {
      gooeyToast.error(err.response?.data?.message || "Failed to update permissions.");
    }
  };

  // ==========================================
  // --- Admin User Management Handlers ---
  // ==========================================

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || (!editingAdmin && !password)) {
      gooeyToast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (editingAdmin) {
        // Update existing admin
        const res = await axios.put(`${backendUrl}/admin/users/${editingAdmin._id}`, {
          username,
          email,
          role: userRole,
          password: password || undefined
        });
        setAdmins(admins.map(a => a._id === editingAdmin._id ? res.data : a));
        gooeyToast.success("Administrator account updated successfully.");
      } else {
        // Create new admin
        const res = await axios.post(`${backendUrl}/admin/users`, {
          username,
          email,
          password,
          role: userRole
        });
        setAdmins([...admins, res.data]);
        gooeyToast.success("Administrator account created successfully.");
      }
      closeUserModal();
    } catch (err: any) {
      gooeyToast.error(err.response?.data?.message || "Failed to save administrator.");
    }
  };

  const handleRoleChangeDropdown = async (adminId: string, newRole: string) => {
    try {
      const res = await axios.put(`${backendUrl}/admin/users/${adminId}`, {
        role: newRole
      });
      setAdmins(admins.map(a => a._id === adminId ? res.data : a));
      gooeyToast.success("Administrator role reassigned successfully.");
    } catch (err: any) {
      gooeyToast.error(err.response?.data?.message || "Failed to update role.");
    }
  };

  const handleDeleteAdmin = async (adminId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete administrator account '${name}'?`)) return;

    try {
      await axios.delete(`${backendUrl}/admin/users/${adminId}`);
      setAdmins(admins.filter(a => a._id !== adminId));
      gooeyToast.success("Administrator deleted successfully.");
    } catch (err: any) {
      gooeyToast.error(err.response?.data?.message || "Failed to delete administrator.");
    }
  };

  const openAddModal = () => {
    setEditingAdmin(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setUserRole("support");
    setShowUserModal(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setUsername(admin.username);
    setEmail(admin.email || "");
    setPassword("");
    setUserRole(admin.role);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingAdmin(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="font-mono text-sm text-gray-500 tracking-wider">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-wider text-gray-950 uppercase">Roles & Admins Control</h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fine-grained RBAC configuration and personnel management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ==========================================
            COLUMN 1: ADMINISTRATOR MANAGEMENT
            ========================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="h-5 w-5 text-[#10b981]" />
                <h2 className="font-mono text-md font-bold tracking-wide uppercase text-gray-950">Administrators</h2>
              </div>
              <button
                type="button"
                onClick={openAddModal}
                className="flex items-center gap-1.5 rounded-lg bg-[#10b981] px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider uppercase text-white hover:bg-emerald-600 transition-colors shadow-sm"
              >
                <UserPlusIcon className="h-4 w-4" />
                Add Admin
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Role Selector</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono text-[12px]">
                  {admins.map((admin) => (
                    <tr key={admin._id} className="group hover:bg-gray-50/50">
                      <td className="py-3 pr-2">
                        <p className="font-bold text-gray-900">{admin.username}</p>
                        <p className="text-[10px] text-gray-400 font-normal">{admin.email || "No email"}</p>
                      </td>
                      <td className="py-3">
                        {admin.role === "superadmin" ? (
                          <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
                            superadmin
                          </span>
                        ) : (
                          <select
                            value={admin.role}
                            onChange={(e) => handleRoleChangeDropdown(admin._id, e.target.value)}
                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 outline-none focus:border-emerald-500"
                          >
                            {roles
                              .filter((r) => r.name !== "superadmin")
                              .map((r) => (
                                <option key={r._id} value={r.name}>
                                  {r.name}
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(admin)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            title="Edit Account Details"
                          >
                            <KeyIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmin(admin._id, admin.username)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete Account"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ==========================================
            COLUMN 2: ROLE CREATION & PERMISSION MATRIX
            ========================================== */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-mono text-md font-bold tracking-wide uppercase text-gray-950 flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-[#10b981]" />
              Role Permissions Configurator
            </h2>

            {/* Custom Role Creation */}
            <form onSubmit={handleCreateRole} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name (e.g. manager, support)..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs outline-none focus:border-emerald-500 placeholder-gray-400"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-[#10b981] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white hover:bg-emerald-600 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Create Role
              </button>
            </form>

            {/* Role List Pills */}
            <div className="mb-6 flex flex-wrap gap-2">
              {roles.map((role) => (
                <div
                  key={role._id}
                  onClick={() => setSelectedRole(role)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs tracking-wide transition-all ${
                    selectedRole?._id === role._id
                      ? "border-[#10b981] bg-emerald-50/50 font-bold text-[#10b981]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="uppercase">{role.name}</span>
                  {role.name !== "superadmin" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role._id, role.name);
                      }}
                      className="text-gray-400 hover:text-red-500 ml-1"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>

            {selectedRole && (
              <div>
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 gap-2">
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase text-gray-950">
                      Module Permissions matrix for: <span className="text-[#10b981]">{selectedRole.name}</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      {selectedRole.name === "superadmin"
                        ? "Superadmin possesses global permissions automatically bypasses guards."
                        : "Configure access restrictions below"}
                    </p>
                  </div>

                  {selectedRole.name !== "superadmin" && (
                    <div className="flex gap-2 font-mono text-[9px] font-bold uppercase tracking-wider">
                      <button
                        type="button"
                        onClick={() => handleToggleAllPermissions(true)}
                        className="rounded border border-gray-200 px-2 py-1 text-gray-600 hover:border-gray-300 hover:text-gray-950 transition-colors"
                      >
                        Grant All
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAllPermissions(false)}
                        className="rounded border border-gray-200 px-2 py-1 text-gray-600 hover:border-gray-300 hover:text-gray-950 transition-colors"
                      >
                        Revoke All
                      </button>
                    </div>
                  )}
                </div>

                {/* Permissions Checkbox Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                        <th className="pb-3 text-left">Application Module</th>
                        <th className="pb-3">Read</th>
                        <th className="pb-3">Create</th>
                        <th className="pb-3">Update</th>
                        <th className="pb-3">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[12px] font-semibold text-gray-700">
                      {MODULES.map((module) => (
                        <tr key={module.key} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-medium pr-4">{module.name}</td>
                          {ACTIONS.map((action) => {
                            const isChecked =
                              selectedRole.name === "superadmin" ||
                              selectedRole.permissions.includes(`${module.key}:${action}`);
                            return (
                              <td key={action} className="py-2.5 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={selectedRole.name === "superadmin"}
                                    onChange={() => handlePermissionToggle(module.key, action)}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-500"
                                  />
                                </label>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          ADD/EDIT ADMIN USER MODAL
          ========================================== */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
            <h3 className="mb-4 font-mono text-md font-bold uppercase text-gray-950 flex items-center gap-2">
              <KeyIcon className="h-5 w-5 text-[#10b981]" />
              {editingAdmin ? `Credentials: ${editingAdmin.username}` : "New Administrator Account"}
            </h3>

            <form onSubmit={handleSaveAdmin} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wide">Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. inventory_coordinator"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wide">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. manager@govigi.com"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Password {editingAdmin && "(Leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wide">Assign Role</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 font-semibold text-gray-700"
                >
                  <option value="superadmin">superadmin</option>
                  {roles
                    .filter((r) => r.name !== "superadmin")
                    .map((r) => (
                      <option key={r._id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeUserModal}
                  className="rounded-lg border border-gray-200 px-4 py-2 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#10b981] px-4 py-2 font-bold text-white hover:bg-emerald-600 transition-colors"
                >
                  {editingAdmin ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
