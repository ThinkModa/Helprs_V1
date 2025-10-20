'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Users, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { UserService, PositionWithStats } from '@/lib/database/users'

interface PositionsManagementProps {
  companyId: string
}

interface PositionFormData {
  name: string
  description: string
  color: string
}

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export function PositionsManagement({ companyId }: PositionsManagementProps) {
  const [positions, setPositions] = useState<PositionWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPosition, setEditingPosition] = useState<PositionWithStats | null>(null)
  const [formData, setFormData] = useState<PositionFormData>({
    name: '',
    description: '',
    color: defaultColors[0]
  })
  const [saving, setSaving] = useState(false)

  const userService = new UserService(null as any) // Mock service for now

  useEffect(() => {
    loadPositions()
  }, [companyId])

  const loadPositions = async () => {
    try {
      setLoading(true)
      const data = await userService.getPositions(companyId)
      setPositions(data)
    } catch (error) {
      console.error('Error loading positions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setSaving(true)
      
      if (editingPosition) {
        // Update existing position
        const updated = await userService.updatePosition(editingPosition.id, {
          name: formData.name,
          description: formData.description,
          color: formData.color
        })
        if (updated) {
          setPositions(prev => prev.map(p => p.id === editingPosition.id ? updated : p))
        }
      } else {
        // Create new position
        const newPosition = await userService.createPosition({
          company_id: companyId,
          name: formData.name,
          description: formData.description,
          color: formData.color
        })
        setPositions(prev => [...prev, newPosition])
      }

      // Reset form
      setFormData({ name: '', description: '', color: defaultColors[0] })
      setShowAddModal(false)
      setEditingPosition(null)
    } catch (error) {
      console.error('Error saving position:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (position: PositionWithStats) => {
    setFormData({
      name: position.name,
      description: position.description || '',
      color: position.color
    })
    setEditingPosition(position)
    setShowAddModal(true)
  }

  const handleDelete = async (position: PositionWithStats) => {
    if (position.user_count > 0) {
      alert(`Cannot delete position "${position.name}" because it has ${position.user_count} user(s) assigned. Please reassign users first.`)
      return
    }

    if (confirm(`Are you sure you want to delete the position "${position.name}"?`)) {
      try {
        const success = await userService.deletePosition(position.id)
        if (success) {
          setPositions(prev => prev.filter(p => p.id !== position.id))
        }
      } catch (error) {
        console.error('Error deleting position:', error)
      }
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', description: '', color: defaultColors[0] })
    setShowAddModal(false)
    setEditingPosition(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading positions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Positions</h2>
          <p className="text-gray-600 mt-1">Manage job positions and roles for your team</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Position
        </Button>
      </div>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map((position) => (
          <Card key={position.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: position.color }}
                />
                <div>
                  <h3 className="font-medium text-gray-900">{position.name}</h3>
                  {position.description && (
                    <p className="text-sm text-gray-600 mt-1">{position.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(position)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(position)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={position.user_count > 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{position.user_count} user{position.user_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{position.active_users} active</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {positions.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No positions yet</h3>
            <p className="text-gray-600 mb-4">Create your first position to organize your team</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPosition ? 'Edit Position' : 'Add Position'}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Position Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Crew Member, Team Lead"
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this position"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {formData.color === color && (
                        <Check className="w-4 h-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={saving || !formData.name.trim()}
                >
                  {saving ? 'Saving...' : editingPosition ? 'Update Position' : 'Create Position'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
