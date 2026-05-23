"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Shield,
  AlertCircle,
  RefreshCw,
  Crown,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type AdminRole =
  | "super_admin"
  | "platform_admin"
  | "content_admin"
  | "support_admin";

interface AdminPermissions {
  manageUsers: boolean;
  manageProfessionals: boolean;
  managePatients: boolean;
  approveProfessionals: boolean;
  manageContent: boolean;
  viewAnalytics: boolean;
  manageReports: boolean;
  manageBilling: boolean;
  manageAdmins: boolean;
  createAdmins: boolean;
  deleteAdmins: boolean;
  manageSettings: boolean;
  managePlatform: boolean;
}

interface AdminUser {
  id: string;
  userId: string;
  role: AdminRole;
  permissions: AdminPermissions;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
  createdBy: {
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  lastLogin?: string;
}

interface AdminData {
  admins: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface RoleInfo {
  role: AdminRole;
  name: string;
  description: string;
  permissions: AdminPermissions;
}

const getRoleIcon = (role: AdminRole) => {
  switch (role) {
    case "super_admin":
      return <Crown className="h-4 w-4" />;
    case "platform_admin":
      return <Shield className="h-4 w-4" />;
    case "content_admin":
      return <Settings className="h-4 w-4" />;
    case "support_admin":
      return <Users className="h-4 w-4" />;
  }
};

const getRoleBadgeColor = (role: AdminRole) => {
  switch (role) {
    case "super_admin":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "platform_admin":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "content_admin":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "support_admin":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  }
};

export default function AdminsPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([]);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        search: searchQuery,
        role: roleFilter,
      });
      const response = await fetch(`/api/admin/admins?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/roles");
      if (response.ok) {
        const result = await response.json();
        setAvailableRoles(result.roles);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, [fetchAdmins, fetchRoles]);

  const admins = data?.admins || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-foreground">
              Admin Management
            </h1>
            <p className="text-muted-foreground font-light mt-2">
              Manage administrator accounts and permissions
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card p-6 border border-border/40"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-card border border-border/40">
          <div className="p-6 border-b border-border/40">
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded w-full max-w-md"></div>
            </div>
          </div>
          <div className="animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded m-6"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-foreground">
              Admin Management
            </h1>
            <p className="text-muted-foreground font-light mt-2">
              Manage administrator accounts and permissions
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border/40">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-light text-foreground mb-2">
                Failed to load admin data
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={fetchAdmins}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light text-foreground">
            Admin Management
          </h1>
          <p className="text-muted-foreground font-light mt-2">
            Manage administrator accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Administrator</DialogTitle>
                <DialogDescription>
                  Add a new administrator with specific role and permissions.
                </DialogDescription>
              </DialogHeader>
              <CreateAdminForm
                roles={availableRoles}
                onSuccess={() => {
                  setShowCreateDialog(false);
                  fetchAdmins();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-card p-6 border border-border/40">
          <p className="text-sm font-light text-muted-foreground">
            Total Admins
          </p>
          <p className="text-2xl font-serif font-light text-foreground mt-2">
            {data?.pagination.total || 0}
          </p>
        </div>
        <div className="rounded-xl bg-card p-6 border border-border/40">
          <p className="text-sm font-light text-muted-foreground">
            Super Admins
          </p>
          <p className="text-2xl font-serif font-light text-foreground mt-2">
            {admins.filter((a) => a.role === "super_admin").length}
          </p>
        </div>
        <div className="rounded-xl bg-card p-6 border border-border/40">
          <p className="text-sm font-light text-muted-foreground">
            Platform Admins
          </p>
          <p className="text-2xl font-serif font-light text-foreground mt-2">
            {admins.filter((a) => a.role === "platform_admin").length}
          </p>
        </div>
        <div className="rounded-xl bg-card p-6 border border-border/40">
          <p className="text-sm font-light text-muted-foreground">
            Active Today
          </p>
          <p className="text-2xl font-serif font-light text-foreground mt-2">
            {
              admins.filter((a) => {
                if (!a.lastLogin) return false;
                const today = new Date();
                const lastLogin = new Date(a.lastLogin);
                return lastLogin.toDateString() === today.toDateString();
              }).length
            }
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border/40">
        <div className="p-6 border-b border-border/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="platform_admin">Platform Admin</SelectItem>
                  <SelectItem value="content_admin">Content Admin</SelectItem>
                  <SelectItem value="support_admin">Support Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  Administrator
                </th>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  Role
                </th>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  Created By
                </th>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  Last Login
                </th>
                <th className="text-left p-4 text-sm font-light text-muted-foreground">
                  Created
                </th>
                <th className="text-right p-4 text-sm font-light text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-t border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-light text-foreground">
                        {admin.user.firstName} {admin.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {admin.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={`inline-flex items-center gap-1 ${getRoleBadgeColor(admin.role)}`}
                    >
                      {getRoleIcon(admin.role)}
                      {admin.role.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm font-light text-muted-foreground">
                    {admin.createdBy
                      ? `${admin.createdBy.firstName} ${admin.createdBy.lastName}`
                      : "System"}
                  </td>
                  <td className="p-4 text-sm font-light text-muted-foreground">
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="p-4 text-sm font-light text-muted-foreground">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Permissions</DropdownMenuItem>
                        <DropdownMenuItem>Edit Role</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {admins.length === 0 && (
            <div className="p-12 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No administrators found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateAdminForm({
  roles,
  onSuccess,
}: {
  roles: RoleInfo[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "support_admin" as AdminRole,
    useCustomPermissions: false,
  });
  const [customPermissions] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        ...(formData.useCustomPermissions &&
          customPermissions && {
            customPermissions,
          }),
      };

      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create admin");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find((r) => r.role === formData.role);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            value={formData.lastName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Admin Role</label>
        <Select
          value={formData.role}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, role: value as AdminRole }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.role} value={role.role}>
                <div className="flex items-center gap-2">
                  {getRoleIcon(role.role)}
                  {role.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRole && (
          <p className="text-xs text-muted-foreground mt-1">
            {selectedRole.description}
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Admin"}
        </Button>
      </div>
    </form>
  );
}
