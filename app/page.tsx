import Link from 'next/link'
import {
  Heart,
  Shield,
  Bot,
  ClipboardList,
  Users,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  Building2,
  User,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">ClinAI Bridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
          <Bot className="h-3.5 w-3.5" />
          AI-Powered Clinic Communication
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            ClinAI Bridge
          </span>
        </h1>
        <p className="text-xl text-gray-600 font-medium mb-3">
          Clinic support, not a replacement for care.
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
          A secure, AI-assisted communication platform connecting patients with their care
          team. Powered by your doctor&apos;s care plan, guided by clinic policies.
        </p>

        {/* Demo account buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <p className="text-sm text-gray-500 font-medium sm:mr-2">Try a demo:</p>
          <Link
            href="/doctor"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Stethoscope className="h-4 w-4" />
            Doctor Portal
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <Building2 className="h-4 w-4" />
            Admin Portal
          </Link>
          <Link
            href="/patient"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <User className="h-4 w-4" />
            Patient Portal
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Demo credentials are pre-filled. Click any portal above to try it instantly.
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Everything your clinic needs
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A complete workflow platform for patients, doctors, and administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: 'AI-Powered Patient Support',
              description:
                "Patients get instant, care-plan-grounded responses from our AI assistant. Questions answered based on your doctor's notes and clinic policies.",
              color: 'bg-blue-50 text-blue-600',
            },
            {
              icon: ClipboardList,
              title: 'Care Plan Management',
              description:
                'Doctors create and update structured care plans with diagnosis summaries, treatment steps, risk factors, and escalation thresholds.',
              color: 'bg-indigo-50 text-indigo-600',
            },
            {
              icon: AlertCircle,
              title: 'Smart Escalation Engine',
              description:
                'Our policy engine automatically detects high-risk conversations and escalates them to the appropriate care team member.',
              color: 'bg-red-50 text-red-500',
            },
            {
              icon: Shield,
              title: 'Safety-First Design',
              description:
                'Built-in guardrails prevent the AI from diagnosing, prescribing, or providing false reassurance. Emergency protocols always activated.',
              color: 'bg-green-50 text-green-600',
            },
            {
              icon: Users,
              title: 'Multi-Role Portals',
              description:
                'Dedicated workspaces for patients, doctors, and admins. Role-based access ensures the right people see the right information.',
              color: 'bg-amber-50 text-amber-600',
            },
            {
              icon: Heart,
              title: 'Patient-Centered',
              description:
                'Every interaction is centered on patient wellbeing, with compassionate communication and clear handoffs to human care when needed.',
              color: 'bg-pink-50 text-pink-600',
            },
          ].map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              How ClinAI Bridge works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Doctor sets up care plan',
                description: "Your doctor creates a personalized care plan with your diagnosis, treatment steps, and escalation thresholds in the system.",
              },
              {
                step: '02',
                title: 'Patient chats with AI',
                description: "You chat with our AI assistant that responds based specifically on your care plan and your clinic's guidelines.",
              },
              {
                step: '03',
                title: 'Team gets notified',
                description: 'High-risk messages are automatically flagged for doctor or admin review. Your care team stays informed without constant monitoring.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Disclaimer */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">
                Important Safety Notice
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                <strong>ClinAI Bridge is a clinic support assistant and does not replace emergency
                or medical care.</strong> This platform is for non-urgent communication and care plan
                support only. For medical emergencies, call your local emergency services (911 in
                the US) immediately. Never delay seeking emergency care based on information from
                this platform. ClinAI Bridge does not diagnose conditions, prescribe medications,
                or provide emergency medical advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to try ClinAI Bridge?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Explore the demo with pre-seeded patient data, care plans, and AI conversations.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            View Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Heart className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-700 text-sm">ClinAI Bridge</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            For emergencies, always call 911. This platform does not replace medical care.
          </p>
          <p className="text-xs text-gray-400">
            Built with Next.js, Prisma &amp; Gemini AI
          </p>
        </div>
      </footer>
    </div>
  )
}
