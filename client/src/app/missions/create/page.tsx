"use client";

import Navigation from "@/components/Navigation";

export default function MissionCreate() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Mission</h1>

        {/* Wizard Steps */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-3 font-semibold">Basic Info</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="ml-3 text-gray-600">Define Area</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="ml-3 text-gray-600">Assign Bot</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <span className="ml-3 text-gray-600">Parameters</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <span className="ml-3 text-gray-600">Review</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Step 1: Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mission Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border rounded-md" 
                placeholder="Enter mission name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea 
                className="w-full px-4 py-2 border rounded-md" 
                rows={4}
                placeholder="Enter mission description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select className="w-full px-4 py-2 border rounded-md">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button className="px-6 py-2 border rounded-md hover:bg-gray-100">
              Cancel
            </button>
            <button className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
              Next Step
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
