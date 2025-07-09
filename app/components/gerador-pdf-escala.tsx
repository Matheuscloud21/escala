"use client"

import { motion } from "framer-motion"
import { FileText, Download, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EscalaItem, Militar } from "../page"

interface Props {
  escala: EscalaItem[]
  militares: Militar[]
}

export default function GeradorPDFEscala({ escala, militares }: Props) {
  const gerarPDF = async () => {
    try {
      console.log('🚀 Iniciando geração do PDF...')
      
      // Calcula estatísticas da escala
      const totalEscalados = escala.filter(item => item.militar).length
      const totalVagos = escala.filter(item => !item.militar).length
      const percentualPreenchimento = escala.length > 0 ? Math.round((totalEscalados / escala.length) * 100) : 0
      
      // Determina o período da escala
      const agora = new Date()
      const mesAtual = agora.getMonth()
      const anoAtual = agora.getFullYear()
      const periodo = `01 a 31 de ${["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][mesAtual]} de ${anoAtual}`

      // Data e hora atuais para geração
      const dataGeracao = agora.toLocaleDateString("pt-BR")
      const horaGeracao = agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })

      const dadosEscala = {
        // Dados globais
        periodo,
        dataGeracao,
        horaGeracao,
        totalEscalados,
        totalVagos,
        totalMilitares: militares.length,
        percentualPreenchimento,
        
        // Lista da escala - dados específicos que você pediu
        escala: escala.map((item) => ({
          data: item.data, // Data no formato YYYY-MM-DD
          dia: item.dia,   // Dia da semana (Segunda, Terça, etc.)
          militar: item.militar, // Objeto completo do militar
          sobreaviso: item.sobreaviso, // Objeto completo do sobreaviso
        })),
      }

      console.log('📋 Dados sendo enviados:', dadosEscala)

      // Chama a API que gera o PDF
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
        
        console.log('✅ PDF gerado e baixado com sucesso!')
      } else {
        const errorData = await response.json()
        console.error("❌ Erro ao gerar PDF:", errorData)
        alert("Erro ao gerar PDF. Verifique o console para mais detalhes.")
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error)
      alert("Erro na requisição. Verifique o console para mais detalhes.")
    }
  }

  return (
    <div className="space-y-8">
      <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <FileText className="h-6 w-6 text-green-400" />
            Gerar Documento PDF da Escala
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-700/40 backdrop-blur-sm p-6 rounded-xl border border-green-800/20">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-white font-semibold mb-2">Documento Militar Oficial</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Este botão gerará um PDF com a escala formatada no padrão militar brasileiro, 
                  baseado no modelo escala.docx. Cada dia será inserido na posição correta com:
                </p>
                <ul className="text-gray-400 text-sm mt-2 ml-4 list-disc">
                  <li>Data específica (formato DD/MM)</li>
                  <li>Dia da semana (Segunda, Terça, etc.)</li>
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
              Gerar PDF da Escala Militar
            </Button>
          </motion.div>

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Baseado no modelo escala.docx com formato militar oficial
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}