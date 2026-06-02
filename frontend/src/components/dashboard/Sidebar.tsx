"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth/AuthProvider";
import { clearApiCache } from "@/lib/api/client";
import { useMounted } from "@/lib/hooks/useMounted";

function SidebarPlaceholder() {
  return (
    <aside className="w-64 h-full bg-slate-950/90 border-r border-white/5 flex flex-col shrink-0 relative z-20">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="text-2xl bg-slate-800 p-2 rounded-xl border border-slate-700">🎓</div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
              Edu<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Nexus</span>
            </h1>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 mt-2">
          Menu
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-slate-800/40 rounded-xl animate-pulse" />
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="h-10 bg-slate-800/40 rounded-xl animate-pulse" />
      </div>
    </aside>
  );
}

export function Sidebar() {
  const mounted = useMounted();
  const { user, clearSession } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  const links = useMemo(() => {
    const role = user?.role;
    if (role === "ADMIN") {
      return [
        { name: "Dashboard", path: "/dashboard/admin", icon: "📊" },
        { name: "Students", path: "/dashboard/admin/students", icon: "👨‍🎓" },
        { name: "Teachers", path: "/dashboard/admin/teachers", icon: "👨‍🏫" },
        { name: "Classes", path: "/dashboard/admin/classes", icon: "🏫" },
        { name: "Attendance", path: "/dashboard/admin/attendance", icon: "✅" },
        { name: "Grades", path: "/dashboard/admin/grades", icon: "📝" },
        { name: "Fees", path: "/dashboard/admin/fees", icon: "💰" },
        { name: "Notice Board", path: "/dashboard/admin/notices", icon: "📢" },
        { name: "AI Assistant", path: "/dashboard/admin/ai-assistant", icon: "🤖" },
      ];
    }
    if (role === "TEACHER") {
      return [
        { name: "Dashboard", path: "/dashboard/teacher", icon: "📊" },
        { name: "Attendance", path: "/dashboard/teacher/attendance", icon: "✅" },
        { name: "Grades", path: "/dashboard/teacher/grades", icon: "📝" },
        { name: "Notice Board", path: "/dashboard/teacher/notices", icon: "📢" },
        { name: "AI Assistant", path: "/dashboard/teacher/ai-assistant", icon: "🤖" },
      ];
    }
    if (role === "STUDENT") {
      return [
        { name: "Dashboard", path: "/dashboard/student", icon: "📊" },
        { name: "My Grades", path: "/dashboard/student/grades", icon: "📝" },
        { name: "My Attendance", path: "/dashboard/student/attendance", icon: "✅" },
        { name: "Notice Board", path: "/dashboard/student/notices", icon: "📢" },
      ];
    }
    if (role === "PARENT") {
      return [
        { name: "Dashboard", path: "/dashboard/parent", icon: "📊" },
        { name: "Child's Grades", path: "/dashboard/parent/grades", icon: "📝" },
        { name: "Child's Attendance", path: "/dashboard/parent/attendance", icon: "✅" },
        { name: "Fee Status", path: "/dashboard/parent/fees", icon: "💰" },
        { name: "Notice Board", path: "/dashboard/parent/notices", icon: "📢" },
      ];
    }
    return [];
  }, [user?.role]);

  const handleLogout = () => {
    clearApiCache();
    clearSession();
    router.replace("/login");
  };

  if (!mounted) {
    return <SidebarPlaceholder />;
  }

  const roleBase = user ? `/dashboard/${user.role.toLowerCase()}` : "";

  return (
    <aside className="w-64 h-full bg-slate-950/90 border-r border-white/5 flex flex-col shrink-0 relative z-20">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="text-2xl bg-slate-800 p-2 rounded-xl border border-slate-700">🎓</div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
              Edu<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Nexus</span>
            </h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 mt-2">
          {user?.role ? `${user.role} Menu` : "Menu"}
        </div>

        {links.map((link) => {
          const isActive =
            pathname === link.path ||
            (link.path !== roleBase && pathname.startsWith(link.path));
          return (
            <Link
              key={link.path}
              href={link.path}
              prefetch={link.name === "AI Assistant" ? false : true}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 group ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="font-medium text-sm tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-colors font-medium text-sm"
        >
          <span className="text-lg">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
