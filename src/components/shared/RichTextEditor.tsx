'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'

// MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const theme = useTheme()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeholder || 'Nhập nội dung...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Link.configure({
        openOnClick: false
      })
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-3'
      }
    }
  })
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    icon,
    tooltip
  }: {
    onClick: () => void
    isActive?: boolean
    icon: string
    tooltip?: string
  }) => (
    <IconButton
      size='small'
      onClick={onClick}
      color={isActive ? 'primary' : 'default'}
      sx={{
        backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
        borderRadius: 1
      }}
      title={tooltip}
    >
      <i className={icon} />
    </IconButton>
  )

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        '&:hover': {
          borderColor: theme.palette.text.primary
        },
        '&:focus-within': {
          borderColor: theme.palette.primary.main,
          borderWidth: 2
        }
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 1,
          display: 'flex',
          gap: 0.5,
          flexWrap: 'wrap',
          backgroundColor: theme.palette.action.hover
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon='ri-bold'
          tooltip='Bold'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon='ri-italic'
          tooltip='Italic'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon='ri-underline'
          tooltip='Underline'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon='ri-strikethrough'
          tooltip='Strike'
        />

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon='ri-h-1'
          tooltip='H1'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon='ri-h-2'
          tooltip='H2'
        />

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon='ri-list-unordered'
          tooltip='Bullet List'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon='ri-list-ordered'
          tooltip='Ordered List'
        />

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon='ri-align-left'
          tooltip='Align Left'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon='ri-align-center'
          tooltip='Align Center'
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          icon='ri-align-right'
          tooltip='Align Right'
        />
      </Box>

      {/* Editor Content */}
      <Box sx={{ p: 0, minHeight: '150px' }}>
        <EditorContent editor={editor} />
      </Box>
    </Box>
  )
}

export default RichTextEditor
