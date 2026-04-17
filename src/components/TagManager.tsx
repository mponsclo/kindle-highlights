'use client'

import { useState } from 'react'
import { Tag } from '@/lib/types'
import { Plus, X } from 'lucide-react'

interface TagManagerProps {
  tags: Tag[]
  selectedTags: string[]
  onTagToggle: (tagId: string) => void
  onCreateTag?: (name: string, color: string) => void
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
]

export default function TagManager({ 
  tags, 
  selectedTags, 
  onTagToggle, 
  onCreateTag 
}: TagManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0])

  const handleCreateTag = () => {
    if (newTagName.trim() && onCreateTag) {
      onCreateTag(newTagName.trim(), newTagColor)
      setNewTagName('')
      setNewTagColor(PRESET_COLORS[0])
      setShowCreateForm(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTags.includes(tag.id)
                ? 'ring-2 ring-offset-1'
                : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              ['--tw-ring-color' as string]: selectedTags.includes(tag.id) ? tag.color : 'transparent',
            } as React.CSSProperties}
          >
            {tag.name}
            {selectedTags.includes(tag.id) && (
              <X className="w-3 h-3 ml-1" />
            )}
          </button>
        ))}

        {onCreateTag && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Tag
          </button>
        )}
      </div>

      {showCreateForm && onCreateTag && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="space-y-3">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            
            <div className="flex space-x-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    newTagColor === color ? 'scale-110 ring-2 ring-offset-1 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}