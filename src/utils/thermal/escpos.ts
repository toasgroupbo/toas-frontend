// ESC/POS Commands for Epson TM-T20IV and compatible thermal printers

export const ESC = 0x1b
export const GS = 0x1d
export const LF = 0x0a

export const ESCPOS = {
  // Initialize printer
  INIT: [ESC, 0x40],

  // Text alignment
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],

  // Text style
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  UNDERLINE_ON: [ESC, 0x2d, 0x01],
  UNDERLINE_OFF: [ESC, 0x2d, 0x00],
  DOUBLE_HEIGHT_ON: [GS, 0x21, 0x01],
  DOUBLE_WIDTH_ON: [GS, 0x21, 0x10],
  DOUBLE_SIZE_ON: [GS, 0x21, 0x11],
  NORMAL_SIZE: [GS, 0x21, 0x00],

  // Line spacing
  LINE_SPACING_DEFAULT: [ESC, 0x32],
  LINE_SPACING_SET: (n: number) => [ESC, 0x33, n],

  // Paper
  FEED_LINE: [LF],
  FEED_LINES: (n: number) => [ESC, 0x64, n],
  CUT_PAPER: [GS, 0x56, 0x00],
  CUT_PAPER_PARTIAL: [GS, 0x56, 0x01],

  // Character set
  CHARSET_PC850: [ESC, 0x74, 0x02],
  CHARSET_UTF8: [ESC, 0x74, 0x00]
}

export class ESCPOSBuilder {
  private buffer: number[] = []
  private lineWidth: number

  constructor(lineWidth: number = 48) {
    this.lineWidth = lineWidth
    this.init()
  }

  private append(bytes: number[]): this {
    this.buffer.push(...bytes)

    return this
  }

  private appendText(text: string): this {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(text)

    this.buffer.push(...bytes)

    return this
  }

  init(): this {
    return this.append(ESCPOS.INIT)
  }

  alignLeft(): this {
    return this.append(ESCPOS.ALIGN_LEFT)
  }

  alignCenter(): this {
    return this.append(ESCPOS.ALIGN_CENTER)
  }

  alignRight(): this {
    return this.append(ESCPOS.ALIGN_RIGHT)
  }

  bold(on: boolean = true): this {
    return this.append(on ? ESCPOS.BOLD_ON : ESCPOS.BOLD_OFF)
  }

  underline(on: boolean = true): this {
    return this.append(on ? ESCPOS.UNDERLINE_ON : ESCPOS.UNDERLINE_OFF)
  }

  doubleHeight(): this {
    return this.append(ESCPOS.DOUBLE_HEIGHT_ON)
  }

  doubleWidth(): this {
    return this.append(ESCPOS.DOUBLE_WIDTH_ON)
  }

  doubleSize(): this {
    return this.append(ESCPOS.DOUBLE_SIZE_ON)
  }

  normalSize(): this {
    return this.append(ESCPOS.NORMAL_SIZE)
  }

  newLine(count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this.append(ESCPOS.FEED_LINE)
    }

    return this
  }

  text(content: string): this {
    return this.appendText(content)
  }

  line(content: string): this {
    return this.text(content).newLine()
  }

  separator(char: string = '-'): this {
    return this.line(char.repeat(this.lineWidth))
  }

  doubleSeparator(char: string = '='): this {
    return this.line(char.repeat(this.lineWidth))
  }

  emptyLine(): this {
    return this.newLine()
  }

  // Two column layout: left text and right text
  twoColumns(left: string, right: string, fillChar: string = ' '): this {
    const totalLen = this.lineWidth
    const rightLen = right.length
    const leftMaxLen = totalLen - rightLen - 1
    const leftTrimmed = left.substring(0, leftMaxLen)
    const padding = totalLen - leftTrimmed.length - rightLen

    return this.line(leftTrimmed + fillChar.repeat(Math.max(1, padding)) + right)
  }

  // Three column layout
  threeColumns(left: string, center: string, right: string): this {
    const totalLen = this.lineWidth
    const colWidth = Math.floor(totalLen / 3)
    const leftPad = left.substring(0, colWidth).padEnd(colWidth)

    const centerPad = center
      .substring(0, colWidth)
      .padStart(Math.floor(colWidth / 2) + Math.floor(center.length / 2))
      .padEnd(colWidth)

    const rightPad = right.substring(0, colWidth).padStart(colWidth)

    return this.line(leftPad + centerPad + rightPad)
  }

  // Centered text with padding
  centeredText(content: string): this {
    const padding = Math.max(0, Math.floor((this.lineWidth - content.length) / 2))

    return this.line(' '.repeat(padding) + content)
  }

  // Box drawing (ASCII compatible)
  boxTop(): this {
    return this.line('+' + '-'.repeat(this.lineWidth - 2) + '+')
  }

  boxBottom(): this {
    return this.line('+' + '-'.repeat(this.lineWidth - 2) + '+')
  }

  boxMiddle(): this {
    return this.line('+' + '-'.repeat(this.lineWidth - 2) + '+')
  }

  boxLine(content: string): this {
    const innerWidth = this.lineWidth - 4
    const trimmed = content.substring(0, innerWidth)
    const padding = innerWidth - trimmed.length

    return this.line('| ' + trimmed + ' '.repeat(padding) + ' |')
  }

  // Table row
  tableRow(columns: string[], widths: number[]): this {
    let row = ''

    columns.forEach((col, i) => {
      const width = widths[i] || 10

      row += col.substring(0, width).padEnd(width)
    })

    return this.line(row.substring(0, this.lineWidth))
  }

  // Cut paper
  cut(partial: boolean = false): this {
    this.newLine(3)

    return this.append(partial ? ESCPOS.CUT_PAPER_PARTIAL : ESCPOS.CUT_PAPER)
  }

  // Build final buffer
  build(): Uint8Array {
    return new Uint8Array(this.buffer)
  }

  // Get buffer for debugging
  getBuffer(): number[] {
    return [...this.buffer]
  }
}

export default ESCPOSBuilder
