import { useState } from "react";
import ControlTowerStrip from "../components/ControlTowerStrip";
import BoardingPassCard from "../components/BoardingPassCard";
import { employees } from "../data/mockData";

export default function Dashboard({ role, onSelectEmployee }) {
  const [query, setQuery] = useState("");

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-slate-900">Employees</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {role === "admin"
              ? "Everyone in the company, right now."
              : "Your team, right now."}
          </p>
        </div>
        {role === "admin" && (
          <button className="text-sm font-medium px-3 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-800">
            + New employee
          </button>
        )}
      </div>

      {role === "admin" && <ControlTowerStrip employees={employees} />}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search employees"
        className="w-full sm:w-72 border border-slate-200 rounded-md px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-teal-200"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e) => (
          <BoardingPassCard key={e.id} employee={e} onClick={() => onSelectEmployee(e)} />
        ))}
      </div>
    </div>
  );
}
