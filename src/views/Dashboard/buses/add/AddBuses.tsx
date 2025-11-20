'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'

import { SeatType } from '@/types/api/buses'
import type { CreateBusDto, UpdateBusDto, Seat, BusEquipment, DeckType } from '@/types/api/buses'
import { useOwners } from '@/hooks/useOwners'
import { useCreateBus, useUpdateBus, useBusById } from '@/hooks/useBuses'
import { useSnackbar } from '@/contexts/SnackbarContext'
import { useUploadImage } from '@/hooks/useUploadImage'

import StepDatosGenerales from './StepDatosGenerales'
import StepConfiguracion from './StepConfiguracion'
import StepResumen from './StepResumen'

interface DeckFormData {
  deck: number
  deckType: DeckType
  rows: number
  columns: number
  seats: Seat[]
}

const AddBuses = () => {
  const router = useRouter()
  const params = useParams()
  const busId = params?.id as string | undefined
  const isEditMode = !!busId

  const { data: bus, isLoading: busLoading } = useBusById(busId)
  const { data: owners, isLoading: ownersLoading } = useOwners()
  const createMutation = useCreateBus()
  const updateMutation = useUpdateBus()
  const uploadImageMutation = useUploadImage()
  const { showSuccess, showError } = useSnackbar()

  const [activeStep, setActiveStep] = useState(0)
  const [name, setName] = useState('')
  const [plaque, setPlaque] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [owner, setOwner] = useState('')
  const [interiorImage, setInteriorImage] = useState('')
  const [exteriorImage, setExteriorImage] = useState('')
  const [interiorImageFile, setInteriorImageFile] = useState<File | null>(null)
  const [exteriorImageFile, setExteriorImageFile] = useState<File | null>(null)
  const [interiorImagePreview, setInteriorImagePreview] = useState('')
  const [exteriorImagePreview, setExteriorImagePreview] = useState('')
  const [busTypeName, setBusTypeName] = useState('')
  const [equipment, setEquipment] = useState<BusEquipment[]>([])
  const [selectedSeatTool, setSelectedSeatTool] = useState<SeatType>(SeatType.SEAT)

  const [decks, setDecks] = useState<DeckFormData[]>([
    {
      deck: 1,
      deckType: 'SEMICAMA' as DeckType,
      rows: 10,
      columns: 4,
      seats: []
    }
  ])

  useEffect(() => {
    if (bus && isEditMode) {
      setName(bus.name)
      setPlaque(bus.plaque)
      setBrand(bus.brand)
      setModel(bus.model)
      setOwner(bus.owner.id)
      setInteriorImage(bus.interior_image)
      setExteriorImage(bus.exterior_image)

      // Construir URL completa para las imágenes
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

      setInteriorImagePreview(bus.interior_image ? `${baseURL}${bus.interior_image}` : '')
      setExteriorImagePreview(bus.exterior_image ? `${baseURL}${bus.exterior_image}` : '')
      setBusTypeName(bus.busType.name)
      setEquipment(bus.equipment)

      const deckFormData: DeckFormData[] = bus.busType.decks.map(deck => {
        const allSeats = deck.seats
        const maxRow = Math.max(...allSeats.map(s => s.row), 0)
        const maxCol = Math.max(...allSeats.map(s => s.column), 0)

        return {
          deck: deck.deck,
          deckType: deck.deckType,
          rows: maxRow,
          columns: maxCol,
          seats: deck.seats
        }
      })

      setDecks(deckFormData)
    }
  }, [bus, isEditMode])

  // Inicializar grid de asientos cuando cambien las dimensiones
  useEffect(() => {
    setDecks(prevDecks =>
      prevDecks.map(deck => {
        // Si ya tiene asientos configurados, no reinicializar
        if (deck.seats.length > 0) return deck

        // Crear grid vacío
        const seats: Seat[] = []

        for (let row = 1; row <= deck.rows; row++) {
          for (let col = 1; col <= deck.columns; col++) {
            seats.push({
              row,
              column: col,
              type: SeatType.SPACE
            })
          }
        }

        return { ...deck, seats }
      })
    )
  }, [decks.length])

  const steps = ['Datos Generales', 'Tipo y Configuración', 'Resumen']

  const toggleEquipment = (item: BusEquipment) => {
    setEquipment(prev => (prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]))
  }

  const handleCellClick = (deckIndex: number, rowIndex: number, colIndex: number) => {
    setDecks(prevDecks => {
      const newDecks = [...prevDecks]
      const deck = newDecks[deckIndex]
      const seatIndex = deck.seats.findIndex(s => s.row === rowIndex + 1 && s.column === colIndex + 1)

      if (seatIndex !== -1) {
        if (selectedSeatTool === SeatType.SEAT) {
          const isAlreadySeat = deck.seats[seatIndex].type === SeatType.SEAT

          const seatCount = deck.seats.filter(s => s.type === SeatType.SEAT).length
          const newSeatNumber = isAlreadySeat ? deck.seats[seatIndex].seatNumber : `${seatCount + 1}`

          deck.seats[seatIndex] = {
            row: rowIndex + 1,
            column: colIndex + 1,
            seatNumber: newSeatNumber,
            type: SeatType.SEAT
          }
        } else {
          deck.seats[seatIndex] = {
            row: rowIndex + 1,
            column: colIndex + 1,
            type: selectedSeatTool
          }
        }
      }

      return newDecks
    })
  }

  const updateDeckDimensions = (deckIndex: number, rows: number, columns: number) => {
    setDecks(prevDecks => {
      const newDecks = [...prevDecks]
      const deck = newDecks[deckIndex]

      // Crear nuevo grid con las nuevas dimensiones
      const newSeats: Seat[] = []

      for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= columns; col++) {
          // Buscar si ya existe un asiento en esta posición
          const existingSeat = deck.seats.find(s => s.row === row && s.column === col)

          if (existingSeat) {
            newSeats.push(existingSeat)
          } else {
            newSeats.push({
              row,
              column: col,
              type: SeatType.SPACE
            })
          }
        }
      }

      deck.rows = rows
      deck.columns = columns
      deck.seats = newSeats

      return newDecks
    })
  }

  const updateDeck = (index: number, field: keyof DeckFormData, value: any) => {
    const updated = [...decks]

    updated[index] = { ...updated[index], [field]: value }
    setDecks(updated)
  }

  const handleEditSeatNumber = (deckIndex: number, rowIndex: number, colIndex: number, newNumber: string) => {
    setDecks(prevDecks => {
      const newDecks = [...prevDecks]
      const deck = newDecks[deckIndex]
      const seatIndex = deck.seats.findIndex(s => s.row === rowIndex + 1 && s.column === colIndex + 1)

      if (seatIndex !== -1 && deck.seats[seatIndex].type === SeatType.SEAT) {
        deck.seats[seatIndex] = {
          ...deck.seats[seatIndex],
          seatNumber: newNumber
        }
      }

      return newDecks
    })
  }

  const handleInteriorImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setInteriorImageFile(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setInteriorImagePreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleExteriorImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setExteriorImageFile(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setExteriorImagePreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleRemoveInteriorImage = () => {
    setInteriorImagePreview('')
    setInteriorImageFile(null)
    setInteriorImage('')
  }

  const handleRemoveExteriorImage = () => {
    setExteriorImagePreview('')
    setExteriorImageFile(null)
    setExteriorImage('')
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!name || !plaque || !brand || !model || !owner) {
        showError('Por favor complete todos los campos obligatorios')

        return
      }

      if (!interiorImagePreview && !interiorImage) {
        showError('Por favor agregue la imagen interior del bus')

        return
      }

      if (!exteriorImagePreview && !exteriorImage) {
        showError('Por favor agregue la imagen exterior del bus')

        return
      }
    }

    if (activeStep === 1) {
      if (!busTypeName || decks.length === 0) {
        showError('Por favor complete la configuración del tipo de bus')

        return
      }
    }

    setActiveStep(prev => prev + 1)
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    try {
      let finalInteriorImage = interiorImage
      let finalExteriorImage = exteriorImage

      if (interiorImageFile) {
        finalInteriorImage = await uploadImageMutation.mutateAsync(interiorImageFile)
      }

      if (exteriorImageFile) {
        finalExteriorImage = await uploadImageMutation.mutateAsync(exteriorImageFile)
      }

      const builtDecks = decks.map(deck => ({
        deck: deck.deck,
        deckType: deck.deckType,
        seats: deck.seats
      }))

      const payload: CreateBusDto | UpdateBusDto = {
        name,
        plaque,
        equipment,
        interior_image: finalInteriorImage,
        exterior_image: finalExteriorImage,
        brand,
        model,
        busType: {
          name: busTypeName,
          decks: builtDecks
        },
        owner
      }

      if (isEditMode && busId) {
        await updateMutation.mutateAsync({ id: busId, data: payload as UpdateBusDto })
        showSuccess('Bus actualizado correctamente')
      } else {
        await createMutation.mutateAsync(payload as CreateBusDto)
        showSuccess('Bus creado correctamente')
      }

      router.push('/buses/list')
    } catch (error: any) {
      console.error('Error al guardar bus:', error)
      showError(error?.response?.data?.message || 'Error al guardar el bus')
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || uploadImageMutation.isPending || busLoading

  if (busLoading && isEditMode) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <CircularProgress />
      </div>
    )
  }

  const totalSeats = decks.reduce((acc, deck) => acc + deck.seats.filter(s => s.type === SeatType.SEAT).length, 0)

  return (
    <div className='space-y-6'>
      {/* Stepper */}
      <Stepper activeStep={activeStep} className='mb-8'>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Steps Content */}
      {activeStep === 0 && (
        <StepDatosGenerales
          name={name}
          setName={setName}
          plaque={plaque}
          setPlaque={setPlaque}
          brand={brand}
          setBrand={setBrand}
          model={model}
          setModel={setModel}
          owner={owner}
          setOwner={setOwner}
          equipment={equipment}
          toggleEquipment={toggleEquipment}
          interiorImagePreview={interiorImagePreview}
          exteriorImagePreview={exteriorImagePreview}
          handleInteriorImageChange={handleInteriorImageChange}
          handleExteriorImageChange={handleExteriorImageChange}
          handleRemoveInteriorImage={handleRemoveInteriorImage}
          handleRemoveExteriorImage={handleRemoveExteriorImage}
          owners={owners}
          ownersLoading={ownersLoading}
        />
      )}

      {activeStep === 1 && (
        <StepConfiguracion
          busTypeName={busTypeName}
          setBusTypeName={setBusTypeName}
          decks={decks}
          setDecks={setDecks}
          selectedSeatTool={selectedSeatTool}
          setSelectedSeatTool={setSelectedSeatTool}
          handleCellClick={handleCellClick}
          updateDeckDimensions={updateDeckDimensions}
          updateDeck={updateDeck}
          handleEditSeatNumber={handleEditSeatNumber}
        />
      )}

      {activeStep === 2 && (
        <StepResumen
          name={name}
          plaque={plaque}
          brand={brand}
          model={model}
          owner={owner}
          equipment={equipment}
          busTypeName={busTypeName}
          decks={decks}
          totalSeats={totalSeats}
          owners={owners}
        />
      )}

      {/* Navigation Buttons */}
      <div className='flex justify-between items-center mt-6'>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<i className='tabler-arrow-left' />}
          className='min-w-[120px]'
        >
          Anterior
        </Button>
        <div className='flex gap-3'>
          <Button variant='outlined' onClick={() => router.back()} className='min-w-[120px]'>
            Cancelar
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <i className='tabler-check' />}
              className='min-w-[160px]'
            >
              {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar Bus' : 'Crear Bus'}
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={handleNext}
              endIcon={<i className='tabler-arrow-right' />}
              className='min-w-[120px]'
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddBuses
