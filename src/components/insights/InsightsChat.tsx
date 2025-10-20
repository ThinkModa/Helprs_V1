'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Plus, MessageSquare, Trash2, MoreHorizontal, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export function InsightsChat() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock chat sessions for demonstration
  const mockSessions: ChatSession[] = [
    {
      id: 'session-1',
      title: 'Workforce Analytics Overview',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Show me an overview of our workforce performance this month',
          timestamp: new Date(Date.now() - 86400000)
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Based on your workforce data, here are the key insights for this month:\n\n• **Total Active Workers**: 24\n• **Average Completion Rate**: 94.2%\n• **Top Performing Team**: House Cleaning Team (98.1% completion)\n• **Areas for Improvement**: Plumbing Team response time\n\nWould you like me to dive deeper into any specific metric?',
          timestamp: new Date(Date.now() - 86400000)
        }
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'session-2',
      title: 'Customer Satisfaction Analysis',
      messages: [
        {
          id: 'msg-3',
          role: 'user',
          content: 'Analyze customer satisfaction trends',
          timestamp: new Date(Date.now() - 172800000)
        },
        {
          id: 'msg-4',
          role: 'assistant',
          content: 'Customer satisfaction analysis shows:\n\n• **Overall Rating**: 4.7/5.0 (up 0.2 from last month)\n• **Most Satisfied Service**: Office Cleaning (4.9/5.0)\n• **Common Feedback**: "Professional and thorough"\n• **Improvement Areas**: Response time for emergency services\n\nRecommendation: Focus on reducing response time for plumbing emergencies.',
          timestamp: new Date(Date.now() - 172800000)
        }
      ],
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000)
    },
    {
      id: 'session-3',
      title: 'Revenue Optimization',
      messages: [
        {
          id: 'msg-5',
          role: 'user',
          content: 'How can we optimize our revenue?',
          timestamp: new Date(Date.now() - 259200000)
        },
        {
          id: 'msg-6',
          role: 'assistant',
          content: 'Revenue optimization opportunities:\n\n• **Pricing Strategy**: Consider 15% increase for premium services\n• **Service Mix**: Expand high-margin services (deep cleaning, maintenance)\n• **Customer Retention**: Implement loyalty program (potential 20% revenue increase)\n• **Efficiency**: Reduce travel time between appointments\n\nWould you like a detailed implementation plan for any of these strategies?',
          timestamp: new Date(Date.now() - 259200000)
        }
      ],
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 259200000)
    }
  ]

  useEffect(() => {
    setSessions(mockSessions)
    if (mockSessions.length > 0) {
      setCurrentSession(mockSessions[0])
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setSessions([newSession, ...sessions])
    setCurrentSession(newSession)
  }

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session)
  }

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId)
    setSessions(updatedSessions)
    if (currentSession?.id === sessionId) {
      setCurrentSession(updatedSessions.length > 0 ? updatedSessions[0] : null)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    // Update current session with user message
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      title: currentSession.messages.length === 0 ? inputMessage.slice(0, 50) + '...' : currentSession.title,
      updatedAt: new Date()
    }

    setCurrentSession(updatedSession)
    setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s))
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      }

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        updatedAt: new Date()
      }

      setCurrentSession(finalSession)
      setSessions(sessions.map(s => s.id === currentSession.id ? finalSession : s))
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Based on your workforce management data, I can see several key insights. Your team performance has been strong this month with a 94% completion rate. Would you like me to analyze any specific metrics?",
      "Looking at your customer feedback data, satisfaction scores are trending upward. The most common positive feedback mentions 'professional service' and 'attention to detail'. I recommend focusing on response time improvements.",
      "Your revenue analysis shows opportunities in service expansion. Consider adding premium cleaning packages or maintenance contracts. This could increase average customer value by 25-30%.",
      "I notice your scheduling efficiency could be optimized. By reducing travel time between appointments and grouping services by location, you could potentially increase daily capacity by 15-20%.",
      "Your team utilization rates are good, but there's room for improvement in cross-training. Consider having team members learn multiple service types to increase flexibility during peak periods."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={createNewSession}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSession?.id === session.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => selectSession(session)}
              >
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-400">
                      {session.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentSession.title}
              </h2>
              <p className="text-sm text-gray-600">
                AI-powered workforce insights and analytics
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your workforce data, analytics, or insights..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
              <p className="text-gray-600 mb-4">Start a new conversation to get AI-powered insights</p>
              <Button onClick={createNewSession} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
