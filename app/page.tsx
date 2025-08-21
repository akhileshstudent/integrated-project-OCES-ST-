import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-black relative overflow-hidden"
      style={{
        backgroundImage: `
        radial-gradient(1px 1px at 20px 30px, #fff, transparent),
        radial-gradient(1px 1px at 40px 70px, #fff, transparent),
        radial-gradient(1px 1px at 90px 40px, #fff, transparent),
        radial-gradient(1px 1px at 130px 80px, #fff, transparent),
        radial-gradient(1px 1px at 160px 30px, #fff, transparent),
        radial-gradient(1px 1px at 200px 60px, #fff, transparent),
        radial-gradient(1px 1px at 250px 20px, #fff, transparent),
        radial-gradient(1px 1px at 280px 90px, #fff, transparent)
      `,
        backgroundRepeat: "repeat",
        backgroundSize: "300px 120px",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-4 text-4xl animate-float">🪐</div>
        <div className="absolute top-32 left-4 text-3xl animate-float-delayed">🌙</div>
        <div className="absolute top-64 right-8 text-3xl animate-pulse-slow">⭐</div>
        <div className="absolute bottom-32 left-6 text-2xl animate-float">☄️</div>
        <div className="absolute bottom-64 right-12 text-2xl animate-float-delayed">🌍</div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <div className="animate-fade-in-up mb-6">
            <div className="inline-block bg-white rounded-2xl px-8 py-4 shadow-2xl">
              <div className="text-9xl md:text-[12rem] font-black tracking-wider relative overflow-hidden">
                <span className="relative z-10 bg-gradient-to-r from-black via-slate-800 to-blue-900 bg-clip-text text-transparent font-bold rocket-text">
                  OCES
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-400">
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Link href="/auth/login">
              <span className="flex items-center gap-2">🚀 Sign In</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black transform hover:scale-105 transition-all duration-300 bg-transparent"
          >
            <Link href="/auth/signup">
              <span className="flex items-center gap-2">⭐ Create Account</span>
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <Card className="animate-fade-in-up animation-delay-600 hover:transform hover:scale-105 transition-all duration-300 bg-gray-900/80 backdrop-blur-sm border border-gray-700 shadow-lg hover:shadow-xl p-6">
            <CardHeader className="pb-6">
              <CardTitle className="text-blue-400 flex items-center gap-3 text-2xl">
                <span className="text-4xl animate-bounce-gentle">🔍</span>
                Discover Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-lg leading-relaxed">
                Browse through a wide variety of campus events including academic seminars, sports games, social
                gatherings, and career fairs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up animation-delay-800 hover:transform hover:scale-105 transition-all duration-300 bg-gray-900/80 backdrop-blur-sm border border-gray-700 shadow-lg hover:shadow-xl p-6">
            <CardHeader className="pb-6">
              <CardTitle className="text-purple-400 flex items-center gap-3 text-2xl">
                <span className="text-4xl animate-pulse">📝</span>
                Easy Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-lg leading-relaxed">
                Register for events with just one click. Get instant confirmations and reminders so you never miss out
                on exciting opportunities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up animation-delay-1000 hover:transform hover:scale-105 transition-all duration-300 bg-gray-900/80 backdrop-blur-sm border border-gray-700 shadow-lg hover:shadow-xl p-6">
            <CardHeader className="pb-6">
              <CardTitle className="text-indigo-400 flex items-center gap-3 text-2xl">
                <span className="text-4xl animate-bounce-gentle animation-delay-500">🤝</span>
                Stay Connected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300 text-lg leading-relaxed">
                Connect with other students, track your event history, and build a vibrant campus community through
                shared experiences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="fixed bottom-8 right-8 animate-bounce-gentle">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full shadow-lg animate-pulse-slow">
            <span className="text-xl">🎯</span>
          </div>
        </div>
      </div>
    </div>
  )
}
