"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter, Calendar, Tag } from "lucide-react"

interface EventFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedDate: string
  onDateChange: (date: string) => void
  onClearFilters: () => void
}

const categories = ["All", "Academic", "Career", "Sports", "Entertainment", "Social", "Workshop", "Other"]

const categoryColors = {
  Academic: "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
  Career: "bg-gradient-to-r from-green-500 to-teal-600 text-white",
  Sports: "bg-gradient-to-r from-orange-500 to-red-600 text-white",
  Entertainment: "bg-gradient-to-r from-pink-500 to-rose-600 text-white",
  Social: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
  Workshop: "bg-gradient-to-r from-indigo-500 to-blue-600 text-white",
  Other: "bg-gradient-to-r from-gray-500 to-slate-600 text-white",
  All: "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
}

export function EventFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDate,
  onDateChange,
  onClearFilters,
}: EventFiltersProps) {
  const hasActiveFilters = searchQuery || selectedCategory !== "All" || selectedDate

  return (
    <div
      className="bg-black border border-gray-700 p-10 rounded-2xl shadow-lg space-y-8 animate-fade-in min-h-[600px] relative overflow-hidden"
      style={{
        backgroundImage: `
        radial-gradient(1px 1px at 20px 30px, #fff, transparent),
        radial-gradient(1px 1px at 40px 70px, #fff, transparent),
        radial-gradient(1px 1px at 90px 40px, #fff, transparent),
        radial-gradient(1px 1px at 130px 80px, #fff, transparent),
        radial-gradient(1px 1px at 160px 30px, #fff, transparent),
        radial-gradient(1px 1px at 200px 60px, #fff, transparent)
      `,
        backgroundRepeat: "repeat",
        backgroundSize: "300px 120px",
      }}
    >
      <div className="absolute top-4 right-4 text-lg opacity-60">🌟</div>
      <div className="absolute bottom-4 left-4 text-lg opacity-60">🪐</div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Filter className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white">Filter Events</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="lg"
            onClick={onClearFilters}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 animate-bounce-subtle px-6 py-3"
          >
            <X className="w-6 h-6 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-400 w-6 h-6 transition-colors duration-300 group-focus-within:text-blue-300" />
        <Input
          placeholder="🔍 Search for amazing events..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-16 h-16 text-xl border-2 border-gray-600 focus:border-blue-400 rounded-xl bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md focus:shadow-lg text-white placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-purple-400" />
            <label className="text-xl font-semibold text-gray-200">Category</label>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => onCategoryChange(category)}
                className={`h-14 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  selectedCategory === category
                    ? categoryColors[category as keyof typeof categoryColors] || "bg-blue-600 text-white"
                    : "border-2 border-gray-600 hover:border-blue-400 bg-gray-800/80 backdrop-blur-sm text-gray-200 hover:text-white"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-green-400" />
            <label className="text-xl font-semibold text-gray-200">Date</label>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-16 text-xl border-2 border-gray-600 focus:border-green-400 rounded-xl bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md focus:shadow-lg text-white"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="animate-slide-up">
          <h4 className="text-lg font-medium text-gray-600 mb-4">Active Filters:</h4>
          <div className="flex flex-wrap gap-3">
            {searchQuery && (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 text-base flex items-center gap-2 hover:shadow-md transition-all duration-300 animate-pulse-subtle">
                🔍 Search: {searchQuery}
                <X
                  className="w-5 h-5 cursor-pointer hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  onClick={() => onSearchChange("")}
                />
              </Badge>
            )}
            {selectedCategory !== "All" && (
              <Badge
                className={`px-6 py-3 text-base flex items-center gap-2 hover:shadow-md transition-all duration-300 animate-pulse-subtle ${categoryColors[selectedCategory as keyof typeof categoryColors]}`}
              >
                🏷️ {selectedCategory}
                <X
                  className="w-5 h-5 cursor-pointer hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  onClick={() => onCategoryChange("All")}
                />
              </Badge>
            )}
            {selectedDate && (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 text-base flex items-center gap-2 hover:shadow-md transition-all duration-300 animate-pulse-subtle">
                📅 {new Date(selectedDate).toLocaleDateString()}
                <X
                  className="w-5 h-5 cursor-pointer hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  onClick={() => onDateChange("")}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
