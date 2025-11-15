export enum BusEquipment {
  WIFI = 'wifi',
  USB_CHARGER = 'usb_charger',
  AIR_CONDITIONING = 'air_conditioning',
  BATHROOM = 'bathroom',
  TV = 'tv',
  RECLINING_SEATS = 'reclining_seats'
}

export enum DeckType {
  LEITO = 'LEITO',
  SEMICAMA = 'SEMICAMA',
  CAMA = 'CAMA',
  EJECUTIVO = 'EJECUTIVO'
}

export enum SeatType {
  SEAT = 'seat',
  AISLE = 'aisle',
  EMPTY = 'empty'
}

export interface Seat {
  row: number
  column: number
  seatNumber: string
  type: SeatType
}

export interface Deck {
  deck: number
  deckType: DeckType
  seats: Seat[]
}

export interface BusType {
  id: string
  name: string
  decks: Deck[]
}

export interface Owner {
  id: string
  name: string
  ci: string
  phone: string
}

export interface Bus {
  id: string
  name: string
  plaque: string
  equipment: BusEquipment[]
  decks: boolean
  owner: Owner
  busType: BusType
}

export interface CreateBusDto {
  name: string
  plaque: string
  equipment: BusEquipment[]
  decks: boolean
  ownerId: string
  busTypeId: string
}

export interface UpdateBusDto {
  name?: string
  plaque?: string
  equipment?: BusEquipment[]
  decks?: boolean
  ownerId?: string
  busTypeId?: string
}
