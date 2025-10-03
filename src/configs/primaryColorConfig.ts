export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

const primaryColorConfig: PrimaryColorConfig[] = [
  {
    name: 'primary-1',
    light: '#64B5F6',
    main: '#1976D2',
    dark: '#0D47A1'
  },
  {
    name: 'primary-2',
    light: '#90CAF9',
    main: '#2196F3',
    dark: '#1565C0'
  },
  {
    name: 'primary-3',
    light: '#4DD0E1',
    main: '#00ACC1',
    dark: '#006064'
  },
  {
    name: 'primary-4',
    light: '#E0E0E0',
    main: '#9E9E9E',
    dark: '#424242'
  },
  {
    name: 'primary-5',
    light: '#FFF176',
    main: '#FBC02D',
    dark: '#F57F17'
  }
]

export default primaryColorConfig
