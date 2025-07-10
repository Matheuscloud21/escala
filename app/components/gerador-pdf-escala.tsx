"use client"

import { motion } from "framer-motion"
import { FileText, Download, CheckCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import type { EscalaItem, Militar } from "../page"

interface Props {
  escala: EscalaItem[]
  militares: Militar[]
  mes: number
  ano: number
}

export default function GeradorPDFEscala({ escala, militares, mes, ano }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(true)

  // Função para preparar os dados da escala
  const prepararDados = () => {
    // Calcula estatísticas da escala
    const totalEscalados = escala.filter(item => item.militar).length
    const totalVagos = escala.filter(item => !item.militar).length
    const percentualPreenchimento = escala.length > 0 ? Math.round((totalEscalados / escala.length) * 100) : 0
    
    // Determina o período da escala com base no mês/ano selecionado
    const periodo = `01 a ${new Date(ano, mes + 1, 0).getDate()} de ${["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][mes]} de ${ano}`

    // Data e hora atuais para geração
    const agora = new Date()
    const dataGeracao = agora.toLocaleDateString("pt-BR")
    const horaGeracao = agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })

    return {
      // Dados globais
      periodo,
      dataGeracao,
      horaGeracao,
      totalEscalados,
      totalVagos,
      totalMilitares: militares.length,
      percentualPreenchimento,
      mes,
      ano,
      // Lista da escala
      escala: escala.map((item) => ({
        data: item.data,
        dia: item.dia,
        militar: item.militar,
        sobreaviso: item.sobreaviso,
      })),
    }
  }

  // Função para gerar preview (atualiza automaticamente)
  const gerarPreview = async () => {
    try {
      const dadosEscala = prepararDados()
      
      const response = await fetch("/api/gerar-pdf-escala", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosEscala),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        // Remove URL anterior se existir
        if (pdfUrl) {
          window.URL.revokeObjectURL(pdfUrl)
        }
        
        setPdfUrl(url)
      }
    } catch (error) {
      console.error("❌ Erro ao gerar preview:", error)
    }
  }

  // Função para baixar PDF
  const baixarPDF = async () => {
    try {
      const dadosEscala = prepararDados()
      
      const response = await fetch("/api/gerar-pdf-escala", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosEscala),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `escala-permanencia-${new Date().toISOString().split("T")[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log('✅ PDF baixado com sucesso!')
      }
    } catch (error) {
      console.error("❌ Erro ao baixar PDF:", error)
    }
  }

  // Atualiza preview automaticamente quando a escala muda
  useEffect(() => {
    if (isPreviewMode && escala.length > 0) {
      gerarPreview()
    }
  }, [escala, militares, isPreviewMode])

  const gerarPDF = baixarPDF // Mantém compatibilidade
  return (
    <div className="space-y-8">
      <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-green-400" />
              Documento PDF da Escala
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                <Eye className="h-4 w-4 mr-1" />
                {isPreviewMode ? "Preview ON" : "Preview OFF"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview do PDF */}
          {isPreviewMode && pdfUrl && (
            <div className="bg-gray-700/40 backdrop-blur-sm p-4 rounded-xl border border-green-800/20">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-400" />
                Preview em Tempo Real
              </h4>
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <iframe
                  src={pdfUrl}
                  className="w-full h-96"
                  title="Preview do PDF da Escala"
                />
              </div>
            </div>
          )}

          <div className="bg-gray-700/40 backdrop-blur-sm p-6 rounded-xl border border-green-800/20">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-white font-semibold mb-2">Documento Militar Oficial</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {isPreviewMode ?
                    "Preview ativo! O PDF é atualizado automaticamente conforme você edita a escala." :
                    "PDF será gerado com a escala formatada no padrão militar brasileiro."
                  }
                </p>
                <ul className="text-gray-400 text-sm mt-2 ml-4 list-disc">
                  <li>Data específica (formato DD.JUL)</li>
                  <li>Dia da semana (Segunda-feira, Terça-feira, etc.)</li>
                  <li>Militar de serviço escalado</li>
                  <li>Militar de sobreaviso</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-700/30 p-3 rounded-lg">
              <div className="text-gray-300">Total Escalados:</div>
              <div className="text-green-400 font-bold">{escala.filter(item => item.militar).length}</div>
            </div>
            <div className="bg-gray-700/30 p-3 rounded-lg">
              <div className="text-gray-300">Total Vagos:</div>
              <div className="text-red-400 font-bold">{escala.filter(item => !item.militar).length}</div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={gerarPDF}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 text-lg shadow-xl"
              size="lg"
            >
              <Download className="h-5 w-5 mr-3" />
              Baixar PDF da Escala Militar
            </Button>
          </motion.div>

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              {isPreviewMode ?
                "Preview ativo - Edite a escala e veja mudanças em tempo real" :
                "Baseado no modelo escala.docx com formato militar oficial"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}