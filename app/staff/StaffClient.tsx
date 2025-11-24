// app/staff/StaffClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Employee = {
    id: string;
    name: string;
    role: string;
    image?: string;
};

type Role = {
    key: string;
    label: string;
};

export default function StaffClient() {
    const [employeesByRole, setEmployeesByRole] = useState<Record<string, Employee[]>>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const metaRes = await fetch("/api/staff/meta");
                if (!metaRes.ok) throw new Error("Failed to fetch meta");
                const meta = await metaRes.json();

                const roleList: Role[] = meta.roles;
                setRoles(roleList);

                if (!selectedRole && roleList.length > 0) {
                    setSelectedRole(roleList[0].key);
                }

                const staffRes = await fetch("/api/staff");
                if (!staffRes.ok) throw new Error("Failed to fetch staff");
                const staffData: Record<string, Employee[]> = await staffRes.json();

                setEmployeesByRole(staffData);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [selectedRole]);

    const getRoleLabel = (key: string) =>
        roles.find((r) => r.key === key)?.label || key;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 text-white">
            <div className="w-full max-w-7xl h-[66vh] mx-auto flex flex-col md:flex-row gap-6 items-stretch">
                {/* LEFT PANEL: positions */}
                <aside className="w-full md:w-1/4 bg-gray-900 border border-gray-800 rounded-lg p-4 h-1/2 md:h-full overflow-auto">
                    <h3 className="text-lg font-semibold mb-4">Positions</h3>
                    <ul className="space-y-2">
                        {roles.map((role) => {
                            const count = (employeesByRole[role.key] || []).length;
                            const active = role.key === selectedRole;
                            return (
                                <li
                                    key={role.key}
                                    onClick={() => setSelectedRole(role.key)}
                                    className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-md transition ${active
                                            ? "bg-gray-600 text-white"
                                            : "bg-gray-800 hover:bg-gray-700"
                                        }`}
                                >
                                    <span>{role.label}</span>
                                    <span className="text-sm text-gray-200 bg-gray-800/50 px-2 py-0.5 rounded">
                                        {count}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                {/* RIGHT PANEL: employee grid */}
                <section className="w-full md:w-2/3 bg-gray-900 border border-gray-800 rounded-lg p-4 h-1/2 md:h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">
                            {getRoleLabel(selectedRole)}
                        </h3>

                        {/* 👇 New "Invite Employee" button */}
                        <button
                            onClick={() => router.push("/staff/invite")}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-50 text-sm px-4 py-2 rounded-md transition border border-gray-700"
                        >
                            Invite Employee
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {employeesByRole[selectedRole] &&
                            employeesByRole[selectedRole].length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {employeesByRole[selectedRole].map((emp) => (
                                    <div
                                        key={emp.id}
                                        onClick={() => router.push(`/staff/${emp.id}`)}
                                        className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col items-center text-center cursor-pointer hover:bg-gray-700 transition"
                                    >
                                        {emp.image ? (
                                            <img
                                                src={emp.image}
                                                alt={emp.name}
                                                className="w-24 h-24 rounded-full mb-3 object-cover"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full mb-3 bg-gray-700 flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                        <div className="font-semibold">{emp.name}</div>
                                        <div className="text-sm text-gray-400">
                                            {getRoleLabel(emp.role)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400">No employees in this role yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
