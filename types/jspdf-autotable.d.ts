import { jsPDF } from 'jspdf'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

interface AutoTableOptions {
  startY?: number
  head?: any[][]
  body?: any[][]
  theme?: 'striped' | 'grid' | 'plain'
  headStyles?: any
  styles?: any
  columnStyles?: any
  margin?: any
  didDrawPage?: (data: any) => void
}

declare module 'jspdf-autotable' {
  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void
}
