import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react'
import './App.css'

type DocumentStatus = 'Digitalizado' | 'Pendente'

interface DocumentRecord {
  id: string
  name: string
  type: string
  date: string
  status: DocumentStatus
  fileName: string
  fileType: string
}

interface DocumentForm {
  name: string
  type: string
  date: string
  status: DocumentStatus
  file: File | null
}

interface FormErrors {
  name?: string
  type?: string
  date?: string
  file?: string
}

const STORAGE_KEY = 'scanner-documentos-registros'
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const ACCEPTED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg']

const initialDocuments: DocumentRecord[] = [
  {
    id: 'doc-001',
    name: 'Contrato de Prestacao de Servicos',
    type: 'Contrato',
    date: '2026-06-05',
    status: 'Digitalizado',
    fileName: 'contrato-servicos.pdf',
    fileType: 'PDF',
  },
  {
    id: 'doc-002',
    name: 'Comprovante de Residencia',
    type: 'Comprovante',
    date: '2026-06-12',
    status: 'Pendente',
    fileName: 'comprovante-residencia.jpg',
    fileType: 'JPG',
  },
  {
    id: 'doc-003',
    name: 'Documento de Identificacao',
    type: 'Documento pessoal',
    date: '2026-06-18',
    status: 'Digitalizado',
    fileName: 'identificacao.png',
    fileType: 'PNG',
  },
]

const emptyForm: DocumentForm = {
  name: '',
  type: '',
  date: '',
  status: 'Pendente',
  file: null,
}

function loadDocuments(): DocumentRecord[] {
  const savedDocuments = localStorage.getItem(STORAGE_KEY)

  if (!savedDocuments) {
    return initialDocuments
  }

  try {
    const parsedDocuments = JSON.parse(savedDocuments) as DocumentRecord[]
    return Array.isArray(parsedDocuments) ? parsedDocuments : initialDocuments
  } catch {
    return initialDocuments
  }
}

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function App() {
  const [documents, setDocuments] = useState<DocumentRecord[]>(loadDocuments)
  const [form, setForm] = useState<DocumentForm>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [fileInputKey, setFileInputKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | DocumentStatus>(
    'Todos',
  )

  const summary = useMemo(() => {
    const scanned = documents.filter(
      (document) => document.status === 'Digitalizado',
    ).length
    const pending = documents.filter(
      (document) => document.status === 'Pendente',
    ).length

    return {
      total: documents.length,
      scanned,
      pending,
    }
  }, [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch = document.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
      const matchesStatus =
        statusFilter === 'Todos' || document.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [documents, searchTerm, statusFilter])

  function saveDocuments(nextDocuments: DocumentRecord[]) {
    setDocuments(nextDocuments)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDocuments))
  }

  function resetForm() {
    setForm(emptyForm)
    setErrors({})
    setFileInputKey((currentKey) => currentKey + 1)
  }

  function validateForm() {
    const nextErrors: FormErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = 'Informe o nome do documento.'
    }

    if (!form.type.trim()) {
      nextErrors.type = 'Informe o tipo do documento.'
    }

    if (!form.date) {
      nextErrors.date = 'Informe a data do documento.'
    }

    if (!form.file) {
      nextErrors.file = 'Selecione um arquivo PDF, PNG ou JPG.'
    } else {
      const extension = getFileExtension(form.file.name)
      const hasAcceptedType = ACCEPTED_FILE_TYPES.includes(form.file.type)
      const hasAcceptedExtension = ACCEPTED_EXTENSIONS.includes(extension)

      if (!hasAcceptedType || !hasAcceptedExtension) {
        nextErrors.file = 'Formato invalido. Use apenas PDF, PNG ou JPG.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleFieldChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null

    setForm((currentForm) => ({
      ...currentForm,
      file: selectedFile,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm() || !form.file) {
      return
    }

    const extension = getFileExtension(form.file.name).toUpperCase()
    const newDocument: DocumentRecord = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      type: form.type.trim(),
      date: form.date,
      status: form.status,
      fileName: form.file.name,
      fileType: extension,
    }

    saveDocuments([newDocument, ...documents])
    resetForm()
  }

  function handleDelete(documentId: string) {
    const nextDocuments = documents.filter((document) => document.id !== documentId)
    saveDocuments(nextDocuments)
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <span className="eyebrow">Sistema academico de QA</span>
          <h1>Scanner de Documentos</h1>
          <p>
            Cadastre, acompanhe e valide documentos digitalizados em uma
            aplicacao simples para planejamento e execucao de testes.
          </p>
        </div>
      </header>

      <section className="summary-grid" aria-label="Resumo dos documentos">
        <article className="summary-card">
          <span>Total de documentos</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="summary-card">
          <span>Digitalizados</span>
          <strong>{summary.scanned}</strong>
        </article>
        <article className="summary-card">
          <span>Pendentes</span>
          <strong>{summary.pending}</strong>
        </article>
      </section>

      <section className="content-grid">
        <form className="panel document-form" onSubmit={handleSubmit} noValidate>
          <div className="panel-heading">
            <h2>Cadastro de documento</h2>
            <p>Use informacoes validas para simular cenarios de teste funcionais.</p>
          </div>

          <label>
            Nome do documento
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleFieldChange}
              placeholder="Ex.: Relatorio de matricula"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label>
            Tipo do documento
            <input
              name="type"
              type="text"
              value={form.type}
              onChange={handleFieldChange}
              placeholder="Ex.: Relatorio, contrato, comprovante"
            />
            {errors.type && <span className="field-error">{errors.type}</span>}
          </label>

          <label>
            Data
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleFieldChange}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={handleFieldChange}>
              <option value="Digitalizado">Digitalizado</option>
              <option value="Pendente">Pendente</option>
            </select>
          </label>

          <label>
            Arquivo
            <input
              key={fileInputKey}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={handleFileChange}
            />
            {errors.file && <span className="field-error">{errors.file}</span>}
          </label>

          <button className="primary-button" type="submit">
            Cadastrar documento
          </button>
        </form>

        <section className="panel documents-panel">
          <div className="panel-heading">
            <h2>Documentos cadastrados</h2>
            <p>Pesquise por nome ou filtre pelo status do documento.</p>
          </div>

          <div className="toolbar">
            <label>
              Pesquisa
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome"
              />
            </label>

            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as 'Todos' | DocumentStatus)
                }
              >
                <option value="Todos">Todos</option>
                <option value="Digitalizado">Digitalizado</option>
                <option value="Pendente">Pendente</option>
              </select>
            </label>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Arquivo</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document.id}>
                    <td data-label="Nome">{document.name}</td>
                    <td data-label="Tipo">{document.type}</td>
                    <td data-label="Data">{formatDate(document.date)}</td>
                    <td data-label="Status">
                      <span
                        className={`status-badge ${
                          document.status === 'Digitalizado'
                            ? 'status-scanned'
                            : 'status-pending'
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>
                    <td className="file-cell" data-label="Arquivo">
                      <span className="file-name">{document.fileName}</span>
                    </td>
                    <td data-label="Acoes">
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => handleDelete(document.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDocuments.length === 0 && (
              <div className="empty-state">
                Nenhum documento encontrado para os filtros informados.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
