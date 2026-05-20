"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface User {
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
}

export function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("edunexus_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getNavLinks = () => {
    const role = user?.role;
    const links = [];

    if (role === "ADMIN") {
      links.push(
        { name: "Dashboard", path: "/dashboard/admin", icon: "📊" },
        { name: "Students", path: "/dashboard/admin/students", icon: "👨‍🎓" },
        { name: "Teachers", path: "/dashboard/admin/teachers", icon: "👨‍🏫" },
        { name: "Classes", path: "/dashboard/admin/classes", icon: "🏫" },
        { name: "Attendance", path: "/dashboard/admin/attendance", icon: "✅" },
        { name: "Grades", path: "/dashboard/admin/grades", icon: "📝" },
        { name: "Fees", path: "/dashboard/admin/fees", icon: "💰" },
        { name: "Notice Board", path: "/dashboard/admin/notices", icon: "📢" },
        { name: "AI Assistant", path: "/dashboard/chat", icon: "🤖" }
      );
    } else if (role === "TEACHER") {
      links.push(
        { name: "Dashboard", path: "/dashboard/teacher", icon: "📊" },
        { name: "Attendance", path: "/dashboard/teacher/attendance", icon: "✅" },
        { name: "Grades", path: "/dashboard/teacher/grades", icon: "📝" },
        { name: "Notice Board", path: "/dashboard/teacher/notices", icon: "📢" },
        { name: "AI Assistant", path: "/dashboard/chat", icon: "🤖" }
      );
    } else if (role === "STUDENT") {
      links.push(
        { name: "Dashboard", path: "/dashboard/student", icon: "📊" },
        { name: "My Grades", path: "/dashboard/student/grades", icon: "📝" },
        { name: "My Attendance", path: "/dashboard/student/attendance", icon: "✅" },
        { name: "Notice Board", path: "/dashboard/student/notices", icon: "📢" }
      );
    } else if (role === "PARENT") {
      links.push(
        { name: "Dashboard", path: "/dashboard/parent", icon: "📊" },
        { name: "Child's Grades", path: "/dashboard/parent/grades", icon: "📝" },
        { name: "Child's Attendance", path: "/dashboard/parent/attendance", icon: "✅" },
        { name: "Fee Status", path: "/dashboard/parent/fees", icon: "💰" },
        { name: "Notice Board", path: "/dashboard/parent/notices", icon: "📢" }
      );
    }
    return links;
  };

  const handleLogout = () => {
    localStorage.removeItem("edunexus_token");
    localStorage.removeItem("edunexus_user");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <aside className="w-64 h-full bg-slate-950/80 border-r border-white/5 backdrop-blur-xl flex flex-col shrink-0 relative z-20 shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative text-2xl bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-lg">🎓</div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">
              Edu<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Nexus</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 mt-2">
          {user?.role ? `${user.role} Menu` : "Loading..."}
        </div>
        
        {getNavLinks().map((link) => {
          const isActive = pathname === link.path || (link.path !== `/dashboard/${user?.role.toLowerCase()}` && pathname.startsWith(link.path));
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {link.icon}
              </span>
              <span className="font-medium text-sm tracking-wide">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-all font-medium text-sm group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
