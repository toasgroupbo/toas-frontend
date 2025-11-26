export enum BusEquipment {
  WIFI = 'wifi',
  USB_CHARGER = 'usb_charger',
  AIR_CONDITIONING = 'air_conditioning',
  BATHROOM = 'bathroom',
  TV = 'tv'
}

export enum DeckType {
  LEITO = 'LEITO',
  SEMICAMA = 'SEMICAMA',
  CAMA = 'CAMA',
  MIXTO = 'MIXTO',
  SUIT_CAMA = 'suit_cama'
}

export enum SeatType {
  SEAT = 'seat',
  AISLE = 'aisle',
  SPACE = 'space'
}

export interface Seat {
  row: number
  column: number
  seatNumber?: string
  type: SeatType
}

export interface Deck {
  deck: number
  deckType: DeckType
  seats: Seat[]
}

export interface BusTypeDto {
  name: string
  decks: Deck[]
}

export interface BusType {
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
  interior_image: string
  exterior_image: string
  brand: string
  model: string
  busType: BusType
  owner: Owner
}

export interface CreateBusDto {
  name: string
  plaque: string
  equipment: BusEquipment[]
  interior_image: string
  exterior_image: string
  brand: string
  model: string
  busType: BusTypeDto
  owner: string
}

export interface UpdateBusDto {
  name?: string
  plaque?: string
  equipment?: BusEquipment[]
  interior_image?: string
  exterior_image?: string
  brand?: string
  model?: string
  busType?: BusTypeDto
  owner?: string
}
