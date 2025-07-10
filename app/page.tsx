"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Calendar, FileText, Shield, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AdicionarMilitar from "./components/adicionar-militar"
import EscalaSemanal from "./components/escala-semanal"
import GeradorPDFEscala from "./components/gerador-pdf-escala"

export interface Militar {
  id: string
  nome: string
  patente: string
  matricula: string
  diasFolga: number
  ultimoServico: string | null
}

export interface EscalaItem {
  dia: string
  data: string
  militar: Militar | null
  sobreaviso: Militar | null
}

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function SistemaEscalaMilitar() {
  const [militares, setMilitares] = useState<Militar[]>([
    {
      id: "1",
      nome: "João Silva Santos",
      patente: "Soldado",
      matricula: "123456",
      diasFolga: 3,
      ultimoServico: "2024-01-05",
    },
    {
      id: "2",
      nome: "Carlos Oliveira Lima",
      patente: "Cabo",
      matricula: "789012",
      diasFolga: 5,
      ultimoServico: "2024-01-03",
    },
    {
      id: "3",
      nome: "Pedro Almeida Costa",
      patente: "3º Sargento",
      matricula: "345678",
      diasFolga: 7,
      ultimoServico: null,
    },
  ])

  const [escala, setEscala] = useState<EscalaItem[]>([])
  const [activeTab, setActiveTab] = useState<"militares" | "escala" | "pdf">("militares")
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())
  const [semanaAtual, setSemanaAtual] = useState(0)

  // Função para obter todas as semanas do mês
  const obterSemanasDoMes = (mes: number, ano: number) => {
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const semanas = []

    // Função para verificar se é dia útil (segunda a sexta)
    const isDiaUtil = (date: Date) => {
      const dia = date.getDay()
      return dia >= 1 && dia <= 5 // 1 = segunda, 5 = sexta
    }

    // Primeira semana: só dias úteis a partir do início do mês
    let dataAtual = new Date(primeiroDia)
    const primeiraSemana = []
    while (dataAtual <= ultimoDia && isDiaUtil(dataAtual)) {
      primeiraSemana.push({
        dia: diasSemana[dataAtual.getDay() === 0 ? 6 : dataAtual.getDay() - 1],
        data: new Date(dataAtual).toISOString().split("T")[0],
        militar: null,
        sobreaviso: null,
      })
      dataAtual.setDate(dataAtual.getDate() + 1)
      // Se sábado ou domingo, pula para segunda
      if (dataAtual.getDay() === 6) dataAtual.setDate(dataAtual.getDate() + 2)
      if (dataAtual.getDay() === 0) dataAtual.setDate(dataAtual.getDate() + 1)
      // Se mudou de mês, para
      if (dataAtual.getMonth() !== mes) break
    }
    if (primeiraSemana.length > 0) semanas.push(primeiraSemana)

    // Demais semanas: sempre de segunda a sexta
    while (dataAtual <= ultimoDia) {
      // Ajusta para segunda-feira
      while (dataAtual.getDay() !== 1 && dataAtual <= ultimoDia) {
        dataAtual.setDate(dataAtual.getDate() + 1)
        if (dataAtual.getMonth() !== mes) break
      }
      if (dataAtual > ultimoDia || dataAtual.getMonth() !== mes) break

      const semana = []
      for (let i = 0; i < 5; i++) { // segunda a sexta
        if (dataAtual > ultimoDia || dataAtual.getMonth() !== mes) break
        semana.push({
          dia: diasSemana[dataAtual.getDay() - 1],
          data: new Date(dataAtual).toISOString().split("T")[0],
          militar: null,
          sobreaviso: null,
        })
        dataAtual.setDate(dataAtual.getDate() + 1)
      }
      if (semana.length > 0) semanas.push(semana)
    }

    // Ajusta a última semana para terminar no último dia útil do mês
    if (semanas.length > 0) {
      const ultimaSemana = semanas[semanas.length - 1]
      // Remove dias após o último dia útil
      while (ultimaSemana.length > 0) {
        const data = new Date(ultimaSemana[ultimaSemana.length - 1].data)
        if (isDiaUtil(data) && data <= ultimoDia) break
        ultimaSemana.pop()
      }
      if (ultimaSemana.length === 0) semanas.pop()
    }

    return semanas
  }

  useEffect(() => {
    const semanas = obterSemanasDoMes(mesAtual, anoAtual)
    if (semanas.length > 0) {
      setEscala(semanas[semanaAtual] || semanas[0])
      if (semanaAtual >= semanas.length) {
        setSemanaAtual(0)
      }
    }
  }, [mesAtual, anoAtual, semanaAtual])

  const adicionarMilitar = (novoMilitar: Omit<Militar, "id">) => {
    const militar: Militar = {
      ...novoMilitar,
      id: Date.now().toString(),
    }
    setMilitares((prev) => [...prev, militar])
  }

  const removerMilitar = (id: string) => {
    setMilitares((prev) => prev.filter((m) => m.id !== id))
    setEscala((prev) => prev.map((item) => ({
      ...item,
      militar: item.militar?.id === id ? null : item.militar,
      sobreaviso: item.sobreaviso?.id === id ? null : item.sobreaviso,
    })))
  }

  const escalarMilitar = (diaIndex: number, militarId: string) => {
    const militarSelecionado = militares.find((m) => m.id === militarId)

    if (militarSelecionado) {
      const novaEscala = [...escala]
      novaEscala[diaIndex] = {
        ...novaEscala[diaIndex],
        militar: militarSelecionado,
      }
      setEscala(novaEscala)

      // Atualizar dias de folga apenas se for a primeira vez escalado nesta semana
      const vezesEscaladoNaSemana = escala.filter((e) => e.militar?.id === militarId).length
      if (vezesEscaladoNaSemana === 0) {
        setMilitares((prev) =>
          prev.map((m) =>
            m.id === militarSelecionado.id
              ? { ...m, diasFolga: 0, ultimoServico: novaEscala[diaIndex].data }
              : { ...m, diasFolga: m.diasFolga + 1 },
          ),
        )
      }
    }
  }

  const escalarSobreaviso = (diaIndex: number, militarId: string) => {
    const militarSelecionado = militares.find((m) => m.id === militarId)

    if (militarSelecionado) {
      const novaEscala = [...escala]
      novaEscala[diaIndex] = {
        ...novaEscala[diaIndex],
        sobreaviso: militarSelecionado,
      }
      setEscala(novaEscala)
    }
  }

  const removerDaEscala = (diaIndex: number) => {
    const militar = escala[diaIndex].militar
    if (militar) {
      const novaEscala = [...escala]
      novaEscala[diaIndex] = { ...novaEscala[diaIndex], militar: null }

      // Verificar se ainda está escalado em outros dias da semana
      const aindaEscaladoNaSemana = novaEscala.some((e) => e.militar?.id === militar.id)

      setEscala(novaEscala)

      // Se não estiver mais escalado na semana, restaurar status
      if (!aindaEscaladoNaSemana) {
        setMilitares((prev) => prev.map((m) => (m.id === militar.id ? { ...m, ultimoServico: null } : m)))
      }
    }
  }

  const removerSobreaviso = (diaIndex: number) => {
    const novaEscala = [...escala]
    novaEscala[diaIndex] = { ...novaEscala[diaIndex], sobreaviso: null }
    setEscala(novaEscala)
  }

  const semanasDoMes = obterSemanasDoMes(mesAtual, anoAtual)

  const tabs = [
    { id: "militares", label: "Militares", icon: Users },
    { id: "escala", label: "Escala", icon: Calendar },
    { id: "pdf", label: "PDF", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #059669 0%, transparent 50%),
            linear-gradient(45deg, transparent 40%, rgba(16, 185, 129, 0.1) 50%, transparent 60%)
          `,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(16, 185, 129, 0.03) 2px,
              rgba(16, 185, 129, 0.03) 4px
            )
          `,
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 bg-gray-900/90 backdrop-blur-sm border-b border-green-800/50 shadow-2xl"
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }} className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full blur opacity-30"></div>
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  Sistema de Escala Militar
                </h1>
                <p className="text-gray-400 text-lg">Controle de Permanência e Folgas</p>
              </div>
            </div>

            {/* Seletor de Mês/Ano */}
            <div className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-800/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-400" />
                <Select value={mesAtual.toString()} onValueChange={(value) => setMesAtual(Number.parseInt(value))}>
                  <SelectTrigger className="w-32 bg-gray-700/50 border-green-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-green-700">
                    {meses.map((mes, index) => (
                      <SelectItem key={index} value={index.toString()} className="text-white hover:bg-green-700/50">
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={anoAtual.toString()} onValueChange={(value) => setAnoAtual(Number.parseInt(value))}>
                <SelectTrigger className="w-24 bg-gray-700/50 border-green-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-700">
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2).map((ano) => (
                    <SelectItem key={ano} value={ano.toString()} className="text-white hover:bg-green-700/50">
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 bg-gray-800/80 backdrop-blur-sm border-b border-green-800/30"
      >
        <div className="container mx-auto px-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 py-4 font-semibold transition-all relative ${
                    activeTab === tab.id ? "text-green-400" : "text-gray-400 hover:text-green-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-t-full"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.nav>

      {/* Seletor de Semana */}
      {semanasDoMes.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 bg-gray-800/60 backdrop-blur-sm border-b border-green-800/20"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSemanaAtual(Math.max(0, semanaAtual - 1))}
                disabled={semanaAtual === 0}
                className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-gray-400">Semana</span>
                <Badge className="bg-green-900/50 text-green-300 border-green-700/50">
                  {semanaAtual + 1} de {semanasDoMes.length}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSemanaAtual(Math.min(semanasDoMes.length - 1, semanaAtual + 1))}
                disabled={semanaAtual === semanasDoMes.length - 1}
                className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "militares" && (
            <motion.div
              key="militares"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400">Total de Militares</p>
                        <p className="text-3xl font-bold text-white">{militares.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400">Escalados</p>
                        <p className="text-3xl font-bold text-white">{escala.filter((e) => e.militar).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400">Maior Folga</p>
                        <p className="text-3xl font-bold text-white">
                          {Math.max(...militares.map((m) => m.diasFolga), 0)} dias
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <AdicionarMilitar onAdicionar={adicionarMilitar} />

              {/* Lista de Militares */}
              <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Users className="h-6 w-6 text-green-400" />
                    Militares Cadastrados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {militares.map((militar, index) => (
                      <motion.div
                        key={militar.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl border border-green-800/20 hover:border-green-700/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {militar.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-lg">{militar.nome}</h3>
                              <p className="text-gray-400">
                                {militar.patente} - Mat: {militar.matricula}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge
                              className={`${
                                militar.diasFolga >= 5
                                  ? "bg-green-900/50 text-green-300 border-green-700/50"
                                  : "bg-gray-700/50 text-gray-300 border-gray-600/50"
                              }`}
                            >
                              {militar.diasFolga} dias de folga
                            </Badge>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removerMilitar(militar.id)}
                              className="bg-red-900/50 hover:bg-red-800/50 border-red-700/50"
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "escala" && (
            <motion.div
              key="escala"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <EscalaSemanal
                escala={escala}
                militares={militares}
                onEscalar={escalarMilitar}
                onEscalarSobreaviso={escalarSobreaviso}
                onRemover={removerDaEscala}
                onRemoverSobreaviso={removerSobreaviso}
                mesAtual={meses[mesAtual]}
                anoAtual={anoAtual}
              />
            </motion.div>
          )}

          {activeTab === "pdf" && (
            <motion.div
              key="pdf"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <GeradorPDFEscala escala={escala} militares={militares} mes={mesAtual} ano={anoAtual} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
