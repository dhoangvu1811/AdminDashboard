'use client'

import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'

interface ImageUploaderProps {
  initialImages?: string[]
  onChange: (files: File[], remainingInitialImages: string[]) => void
  maxImages?: number
}

const ImageUploader = ({ initialImages = [], onChange, maxImages = 5 }: ImageUploaderProps) => {
  const [existingImages, setExistingImages] = useState<string[]>(initialImages)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setExistingImages(initialImages)
  }, [initialImages])

  useEffect(() => {
    // Cleanup previews to avoid memory leaks
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [newPreviews])

  const triggerSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files)
      const validFiles = filesArray.filter(file => file.type.startsWith('image/'))

      // Limit check
      const totalImages = existingImages.length + newFiles.length + validFiles.length
      if (totalImages > maxImages) {
        alert(`Bạn chỉ được tải lên tối đa ${maxImages} ảnh.`)
        return
      }

      const newPreviews = validFiles.map(file => URL.createObjectURL(file))

      const updatedFiles = [...newFiles, ...validFiles]
      setNewFiles(updatedFiles)
      setNewPreviews(prev => [...prev, ...newPreviews])

      onChange(updatedFiles, existingImages)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeExistingImage = (index: number) => {
    const updatedImages = existingImages.filter((_, i) => i !== index)
    setExistingImages(updatedImages)
    onChange(newFiles, updatedImages)
  }

  const removeNewFile = (index: number) => {
    const updatedFiles = newFiles.filter((_, i) => i !== index)

    // Cleanup URL
    URL.revokeObjectURL(newPreviews[index])
    const updatedPreviews = newPreviews.filter((_, i) => i !== index)

    setNewFiles(updatedFiles)
    setNewPreviews(updatedPreviews)
    onChange(updatedFiles, existingImages)
  }

  return (
    <Box>
      <input
        type='file'
        accept='image/*'
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Button
        variant='outlined'
        startIcon={<i className='ri-upload-cloud-line' />}
        onClick={triggerSelect}
        disabled={existingImages.length + newFiles.length >= maxImages}
      >
        Tải ảnh lên ({existingImages.length + newFiles.length}/{maxImages})
      </Button>

      <Typography variant='caption' display='block' sx={{ mt: 1, color: 'text.secondary' }}>
        Chấp nhận định dạng ảnh (jpg, png, webp). Tối đa {maxImages} ảnh.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        {/* Existing Images */}
        {existingImages.map((src, index) => (
          <Box key={`existing-${index}`} sx={{ position: 'relative', width: 100, height: 100 }}>
            <Avatar src={src} variant='rounded' sx={{ width: '100%', height: '100%', border: '1px solid #eee' }} />
            <IconButton
              size='small'
              color='error'
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'background.paper' }
              }}
              onClick={() => removeExistingImage(index)}
            >
              <i className='ri-close-line' style={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}

        {/* New Files */}
        {newPreviews.map((src, index) => (
          <Box key={`new-${index}`} sx={{ position: 'relative', width: 100, height: 100 }}>
            <Avatar src={src} variant='rounded' sx={{ width: '100%', height: '100%', border: '1px solid #1976d2' }} />
            <IconButton
              size='small'
              color='error'
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'background.paper' }
              }}
              onClick={() => removeNewFile(index)}
            >
              <i className='ri-close-line' style={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default ImageUploader
