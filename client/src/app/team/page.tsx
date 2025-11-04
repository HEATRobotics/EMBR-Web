"use client";

import Navigation from "@/components/Navigation";

export default function Team() {
  return (
  <div className="bg-gray-100 min-h-full">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Team Management</h1>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            + Add Team Member
          </button>
        </div>

        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Members</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Active Today</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">On Field Duty</h3>
            <p className="text-3xl font-bold mt-2 text-blue-600">0</p>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Team Members</h2>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Current Assignment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No team members added yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Role Management */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Role Descriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Admin</h3>
              <p className="text-sm text-gray-600">
                Full system access, can manage all missions, bots, and users
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Operator</h3>
              <p className="text-sm text-gray-600">
                Can create and manage missions, view all data
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Field Crew</h3>
              <p className="text-sm text-gray-600">
                View assigned hotspots, update status on-site
              </p>
            </div>
          </div>
        </div>

        {/* Communication Log */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Communication Log</h2>
          <div className="text-gray-500">
            <p>No recent communications</p>
          </div>
        </div>
      </main>
    </div>
  );
}
