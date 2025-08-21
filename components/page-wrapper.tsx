"use client"

import type React from "react"
import { AnimatedSidebar } from "@/components/animated-sidebar"
import { useState, createContext, useContext } from "react"
import { cn } from "@/lib/utils"

interface ViewContextType {
  currentView: "list" | "calendar"
  setCurrentView: (view: "list" | "calendar") => void
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export const useView = () => {
  const context = useContext(ViewContext)
  if (!context) {
    throw new Error("useView must be used within a PageWrapper")
  }
  return context
}

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list")

  return (
    <ViewContext.Provider value={{ currentView, setCurrentView }}>
      <div className="flex h-screen bg-gray-50">
        <AnimatedSidebar currentView={currentView} onViewChange={setCurrentView} />

        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            "lg:ml-0", // Sidebar is static on desktop
            className,
          )}
        >
          <div className="animate-fadeIn">{children}</div>
        </main>
      </div>
    </ViewContext.Provider>
  )
}
