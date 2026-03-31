'use client'

import { useEffect, useMemo } from 'react'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

const TipTapEditor = ({ content, onChange, placeholder = 'Escribe aquí...' }: TipTapEditorProps) => {
  const extensions = useMemo(
    () => [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder })
    ],
    [placeholder]
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('URL del enlace:')

    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover'
        }}
      >
        <Tooltip title='Negrita'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive('bold') ? 'primary' : 'default'}
          >
            <i className='tabler-bold' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Cursiva'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive('italic') ? 'primary' : 'default'}
          >
            <i className='tabler-italic' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Subrayado'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            color={editor.isActive('underline') ? 'primary' : 'default'}
          >
            <i className='tabler-underline' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Tachado'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleStrike().run()}
            color={editor.isActive('strike') ? 'primary' : 'default'}
          >
            <i className='tabler-strikethrough' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <Tooltip title='Título 1'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
          >
            <i className='tabler-h-1' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Título 2'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
          >
            <i className='tabler-h-2' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Título 3'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
          >
            <i className='tabler-h-3' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <Tooltip title='Lista con viñetas'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive('bulletList') ? 'primary' : 'default'}
          >
            <i className='tabler-list' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Lista numerada'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive('orderedList') ? 'primary' : 'default'}
          >
            <i className='tabler-list-numbers' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <Tooltip title='Alinear izquierda'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
          >
            <i className='tabler-align-left' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Centrar'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
          >
            <i className='tabler-align-center' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Alinear derecha'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
          >
            <i className='tabler-align-right' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Justificar'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            color={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'default'}
          >
            <i className='tabler-align-justified' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <Tooltip title='Enlace'>
          <IconButton size='small' onClick={addLink} color={editor.isActive('link') ? 'primary' : 'default'}>
            <i className='tabler-link' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Quitar enlace'>
          <span>
            <IconButton
              size='small'
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
            >
              <i className='tabler-link-off' style={{ fontSize: '18px' }} />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <Tooltip title='Cita'>
          <IconButton
            size='small'
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            color={editor.isActive('blockquote') ? 'primary' : 'default'}
          >
            <i className='tabler-quote' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title='Línea horizontal'>
          <IconButton size='small' onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <i className='tabler-minus' style={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>

        <Divider orientation='vertical' flexItem sx={{ mx: 0.5 }} />

        <Tooltip title='Deshacer'>
          <span>
            <IconButton size='small' onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <i className='tabler-arrow-back-up' style={{ fontSize: '18px' }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title='Rehacer'>
          <span>
            <IconButton size='small' onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <i className='tabler-arrow-forward-up' style={{ fontSize: '18px' }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          p: 2,
          minHeight: 300,
          '& .ProseMirror': {
            outline: 'none',
            minHeight: 280,
            '& p.is-editor-empty:first-child::before': {
              content: 'attr(data-placeholder)',
              color: 'text.disabled',
              float: 'left',
              height: 0,
              pointerEvents: 'none'
            },
            '& h1': { fontSize: '2rem', fontWeight: 700, mb: 2 },
            '& h2': { fontSize: '1.5rem', fontWeight: 600, mb: 1.5 },
            '& h3': { fontSize: '1.25rem', fontWeight: 600, mb: 1 },
            '& p': { mb: 1 },
            '& ul, & ol': { pl: 3, mb: 1 },
            '& blockquote': {
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              pl: 2,
              ml: 0,
              fontStyle: 'italic'
            },
            '& a': { color: 'primary.main', textDecoration: 'underline' },
            '& hr': { my: 2, border: 'none', borderTop: '1px solid', borderColor: 'divider' }
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  )
}

export default TipTapEditor
