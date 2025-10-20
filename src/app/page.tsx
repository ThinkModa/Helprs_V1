'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const devMode = searchParams.get('dev') === 'true'

  useEffect(() => {
    if (!loading && devMode) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router, devMode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (devMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Helprs</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#about" className="text-gray-600 hover:text-gray-900">About Us</Link>
              <Link href="#services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</Link>
            </nav>
            <div className="flex items-center">
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Streamline Your Workforce Management
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional workforce management solutions for businesses — reliable scheduling, time tracking, and team coordination you can trust.
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Operations Manager",
                company: "TechCorp",
                quote: "We've partnered with Helprs for over two years to manage our workforce scheduling. The platform has transformed how we coordinate our teams."
              },
              {
                name: "Michael Chen",
                role: "HR Director", 
                company: "RetailPlus",
                quote: "Helprs has streamlined our employee management process. The time tracking and scheduling features are exactly what we needed."
              },
              {
                name: "Emily Rodriguez",
                role: "Project Manager",
                company: "ServicePro",
                quote: "The workforce management tools in Helprs have made our operations so much more efficient. Highly recommended for any growing business."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 font-medium mb-4">— Who We Are</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Efficient Workforce Management Systems
              </h2>
              <p className="text-gray-600 mb-6">
                At Helprs, we believe that every business deserves seamless workforce coordination. With years of experience in workforce management, we specialize in providing reliable scheduling, time tracking, and team management solutions.
              </p>
              <Link href="/register">
                <Button>Learn More</Button>
              </Link>
            </div>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">About Image Placeholder</span>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Simple Setup Process</h2>
            <p className="text-gray-600">Getting started with Helprs is simple and fast. Follow these easy steps to streamline your workforce management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Create Account", description: "Sign up and set up your company profile in minutes." },
              { step: "2", title: "Add Your Team", description: "Invite team members and set up their roles and permissions." },
              { step: "3", title: "Configure Settings", description: "Customize schedules, time tracking, and notification preferences." },
              { step: "4", title: "Start Managing", description: "Begin scheduling, tracking time, and coordinating your workforce." }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Expert Workforce Management Today</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Employee Scheduling", description: "Smart scheduling with conflict detection and optimization." },
              { title: "Time Tracking", description: "Accurate time tracking with GPS and mobile support." },
              { title: "Team Communication", description: "Built-in messaging and notification system." },
              { title: "Analytics & Reports", description: "Comprehensive insights into workforce performance." }
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="bg-gray-200 h-32 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Service Image</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <Link href="/register">
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Helprs?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Trusted Professionals", description: "At Helprs, our team is made up of experienced workforce management experts who bring years of hands-on experience." },
              { title: "On-Time & Reliable", description: "Our platform is designed for reliability with 99.9% uptime and real-time synchronization." },
              { title: "100% Satisfaction", description: "We guarantee your satisfaction with our comprehensive support and user-friendly interface." }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why People Choose Helprs?</h2>
            <p className="text-gray-600">Guiding principles that shape our approach to workforce management, ensuring unparalleled service and exceptional experiences for our clients.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Lower Operational Costs", description: "Streamlined processes help reduce administrative overhead and improve efficiency." },
              { title: "Better Team Coordination", description: "Clear communication and scheduling reduces conflicts and improves collaboration." },
              { title: "Reduced Scheduling Errors", description: "Automated conflict detection and smart scheduling prevent costly mistakes." },
              { title: "Consistent Performance", description: "Enjoy steady workforce management with real-time insights and analytics." }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Streamline Your Workforce?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you need employee scheduling, time tracking, or team coordination, our platform is ready to help.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Helprs</h3>
              <p className="text-gray-400">Professional workforce management solutions for modern businesses.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#services" className="hover:text-white">Features</Link></li>
                <li><Link href="#about" className="hover:text-white">About</Link></li>
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="text-gray-400 space-y-2">
                <p>Email: support@helprs.com</p>
                <p>Phone: (800) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Helprs. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
