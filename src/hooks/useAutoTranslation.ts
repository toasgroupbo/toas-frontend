import { useState, useEffect, useRef, useCallback } from 'react'

interface WebAITranslator {
  translate: (text: string) => Promise<string>
  destroy: () => void
}

declare global {
  interface Window {
    Translator?: {
      availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<string>
      create: (options: {
        sourceLanguage: string
        targetLanguage: string
        monitor?: (m: any) => void
      }) => Promise<WebAITranslator>
    }
  }
}

interface UseAutoTranslationReturn {
  isTranslating: boolean
  error: string | null
  isSupported: boolean
  translateText: (text: string) => void
  setTargetValue: (value: string) => void
}

const preserveCapitalization = (original: string, translated: string): string => {
  if (!original || !translated) return translated

  if (original === original.toUpperCase() && original !== original.toLowerCase()) {
    return translated.toUpperCase()
  }

  if (original === original.toLowerCase()) {
    return translated.toLowerCase()
  }

  if (original[0] === original[0].toUpperCase() && original.slice(1) === original.slice(1).toLowerCase()) {
    return translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase()
  }

  const originalWords = original.split(/(\s+)/)
  const translatedWords = translated.split(/(\s+)/)

  if (originalWords.filter(w => w.trim()).length !== translatedWords.filter(w => w.trim()).length) {
    return translated.charAt(0).toUpperCase() + translated.slice(1)
  }

  let result = ''
  let originalIndex = 0
  let translatedIndex = 0

  while (originalIndex < originalWords.length && translatedIndex < translatedWords.length) {
    const originalWord = originalWords[originalIndex]
    const translatedWord = translatedWords[translatedIndex]

    if (originalWord.match(/^\s+$/)) {
      result += originalWord
      originalIndex++
      continue
    }

    if (translatedWord.match(/^\s+$/)) {
      result += translatedWord
      translatedIndex++
      continue
    }

    if (originalWord.trim() && translatedWord.trim()) {
      const originalTrimmed = originalWord.trim()
      const translatedTrimmed = translatedWord.trim()

      let processedWord = translatedTrimmed

      // Todo en mayúsculas
      if (originalTrimmed === originalTrimmed.toUpperCase() && originalTrimmed !== originalTrimmed.toLowerCase()) {
        processedWord = translatedTrimmed.toUpperCase()
      }

      // Todo en minúsculas
      else if (originalTrimmed === originalTrimmed.toLowerCase()) {
        processedWord = translatedTrimmed.toLowerCase()
      } else if (originalTrimmed[0] === originalTrimmed[0].toUpperCase()) {
        processedWord = translatedTrimmed.charAt(0).toUpperCase() + translatedTrimmed.slice(1).toLowerCase()
      } else {
        processedWord = translatedTrimmed.toLowerCase()
      }

      result += processedWord
    }

    originalIndex++
    translatedIndex++
  }

  while (translatedIndex < translatedWords.length) {
    result += translatedWords[translatedIndex]
    translatedIndex++
  }

  return result
}

const translateWithFormat = async (translator: WebAITranslator, text: string): Promise<string> => {
  const lines = text.split('\n')
  const translatedLines: string[] = []

  for (const line of lines) {
    if (line.trim() === '') {
      translatedLines.push('')
      continue
    }

    try {
      const translatedLine = await translator.translate(line.trim())

      const formattedLine = preserveCapitalization(line.trim(), translatedLine)

      const leadingSpaces = line.match(/^(\s*)/)?.[1] || ''

      translatedLines.push(leadingSpaces + formattedLine)
    } catch (error) {
      console.warn('Error traduciendo línea:', line, error)

      translatedLines.push(line)
    }
  }

  return translatedLines.join('\n')
}

export const useAutoTranslation = (
  targetSetter: (value: string) => void,
  delay: number = 1500
): UseAutoTranslationReturn => {
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const translatorRef = useRef<WebAITranslator | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supported = 'Translator' in window && typeof window.Translator !== 'undefined'

    setIsSupported(supported)

    if (!supported) {
      setError('Web AI APIs no disponibles. Necesitas Chrome 138+')
    }
  }, [])

  useEffect(() => {
    return () => {
      if (translatorRef.current) {
        translatorRef.current.destroy()
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const initializeTranslator = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      setError(null)

      if (!translatorRef.current) {
        const availability = await window.Translator!.availability({
          sourceLanguage: 'es',
          targetLanguage: 'en'
        })

        if (availability === 'no') {
          throw new Error('Par de idiomas español-inglés no soportado')
        }

        translatorRef.current = await window.Translator!.create({
          sourceLanguage: 'es',
          targetLanguage: 'en'
        })
      }

      return true
    } catch (err: any) {
      setError(err.message || 'Error al inicializar traductor')

      return false
    }
  }, [isSupported])

  const translateText = useCallback(
    (text: string) => {
      if (!text.trim()) {
        targetSetter('')

        return
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          setIsTranslating(true)
          setError(null)

          const initialized = await initializeTranslator()

          if (!initialized || !translatorRef.current) {
            throw new Error('No se pudo inicializar el traductor')
          }

          const translation = await translateWithFormat(translatorRef.current, text)

          targetSetter(translation)
        } catch (err: any) {
          setError(err.message || 'Error en traducción')
          console.error('Error traduciendo:', err)
        } finally {
          setIsTranslating(false)
        }
      }, delay)
    },
    [delay, targetSetter, initializeTranslator]
  )

  const setTargetValue = useCallback(
    (value: string) => {
      targetSetter(value)
    },
    [targetSetter]
  )

  return {
    isTranslating,
    error,
    isSupported,
    translateText,
    setTargetValue
  }
}
