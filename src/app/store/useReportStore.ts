import { create } from 'zustand'
import type { ReportProject, ReportSettings, Paragraph, PDFFile, ReferenceLink } from '@/app/types'

interface ReportStore {
  currentProject: ReportProject | null
  theme: string
  pdfs: PDFFile[]
  links: ReferenceLink[]
  settings: ReportSettings
  paragraphs: Paragraph[]
  
  // Actions
  setTheme: (theme: string) => void
  addPdf: (pdf: PDFFile) => void
  removePdf: (id: string) => void
  addLink: (link: ReferenceLink) => void
  removeLink: (id: string) => void
  updateSettings: (settings: Partial<ReportSettings>) => void
  setParagraphs: (paragraphs: Paragraph[]) => void
  addParagraph: (paragraph: Paragraph) => void
  updateParagraph: (id: string, updates: Partial<Paragraph>) => void
  removeParagraph: (id: string) => void
  resetProject: () => void
}

const defaultSettings: ReportSettings = {
  language: '日本語',
  writingStyle: '常体',
  tone: 'フォーマル',
  quality: '中レベル',
}

export const useReportStore = create<ReportStore>((set) => ({
  currentProject: null,
  theme: '',
  pdfs: [],
  links: [],
  settings: defaultSettings,
  paragraphs: [],
  
  setTheme: (theme) => set({ theme }),
  
  addPdf: (pdf) => set((state) => ({ 
    pdfs: [...state.pdfs, pdf] 
  })),
  
  removePdf: (id) => set((state) => ({ 
    pdfs: state.pdfs.filter(p => p.id !== id) 
  })),
  
  addLink: (link) => set((state) => ({ 
    links: [...state.links, link] 
  })),
  
  removeLink: (id) => set((state) => ({ 
    links: state.links.filter(l => l.id !== id) 
  })),
  
  updateSettings: (newSettings) => set((state) => ({ 
    settings: { ...state.settings, ...newSettings } 
  })),
  
  setParagraphs: (paragraphs) => set({ paragraphs }),
  
  addParagraph: (paragraph) => set((state) => ({ 
    paragraphs: [...state.paragraphs, paragraph] 
  })),
  
  updateParagraph: (id, updates) => set((state) => ({
    paragraphs: state.paragraphs.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    )
  })),
  
  removeParagraph: (id) => set((state) => ({
    paragraphs: state.paragraphs.filter(p => p.id !== id)
  })),
  
  resetProject: () => set({
    currentProject: null,
    theme: '',
    pdfs: [],
    links: [],
    settings: defaultSettings,
    paragraphs: [],
  }),
}))