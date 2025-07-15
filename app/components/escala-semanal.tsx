"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, User, Plus, X, Clock, Shield, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { EscalaItem, Militar, Impedimento } from "../page" // Importar Impedimento

interface Props {
  escala: EscalaItem[]
  militares: Militar[]
  impedimentos: Impedimento[] // Nova prop
  onEscalar: (diaIndex: number, militarId: string) => void
  onEscalarSobreaviso: (diaIndex: number, militarId: string) => void
  onRemover: (diaIndex: number) => void
  onRemoverSobreaviso: (diaIndex: number) => void
  mesAtual: string
  anoAtual: number
}

export default function EscalaSemanal({ escala, militares, impedimentos, onEscalar, onEscalarSobreaviso, onRemover, onRemoverSobreaviso, mesAtual, anoAtual }: Props) {
  const [dialogAberto, setDialogAberto] = useState<number | null>(null)
  const [dialogSobreavisoAberto, setDialogSobreavisoAberto] = useState<number | null>(null)

  const formatarData = (data: string) => {
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const getMilitaresOrdenados = () => {
    return militares.sort((a, b) => b.diasFolga - a.diasFolga)
  }

  const isMilitarImpedido = (militarId: string, dataEscala: string) => {
    const dataEscalaObj = new Date(dataEscala + "T00:00:00");
    return impedimentos.some(imp => {
      if (imp.militarId === militarId) {
        const dataInicioImp = new Date(imp.dataInicio + "T00:00:00");
        const dataFimImp = new Date(imp.dataFim + "T00:00:00");
        return dataEscalaObj >= dataInicioImp && dataEscalaObj <= dataFimImp;
      }
      return false;
    });
  };

  const handleEscalarMilitar = (diaIndex: number, militarId: string) => {
    onEscalar(diaIndex, militarId)
    setDialogAberto(null)
  }

  const handleEscalarSobreaviso = (diaIndex: number, militarId: string) => {
    onEscalarSobreaviso(diaIndex, militarId)
    setDialogSobreavisoAberto(null)
  }

  return (
    <div className="space-y-8">
      {/* Header da Escala */}
      <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Escala de Permanência
              </CardTitle>
              <p className="text-gray-400 mt-2 text-lg">
                {mesAtual} de {anoAtual}
              </p>
            </div>

            <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-green-800/20">
              <div className="flex items-center gap-3 text-gray-300">
                <Users className="h-5 w-5 text-green-400" />
                <span>Total de Militares:</span>
              </div>
              <div className="mt-2">
                <Badge className="bg-blue-900/50 text-blue-300 border-blue-700/50 text-sm">
                  {militares.length} militares
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid da Escala */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {escala.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full bg-gray-800/60 backdrop-blur-sm border-green-800/20 hover:border-green-700/40 transition-all">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{item.dia}</h3>
                    <p className="text-gray-400">{formatarData(item.data)}</p>
                  </div>
                  <Badge className="bg-gray-700/50 text-gray-400 border-gray-600/50">
                    Dia {index + 1}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Militar de Serviço */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">Militar de Serviço</span>
                  </div>
                  {item.militar ? (
                    <div className="bg-gray-700/40 backdrop-blur-sm p-3 rounded-xl border border-green-800/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {item.militar.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{item.militar.nome}</p>
                          <p className="text-gray-400 text-xs">{item.militar.patente}</p>
                        </div>
                        <Button
                          onClick={() => onRemover(index)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-900/50 hover:bg-red-800/50 border-red-700/50 text-red-200 h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Dialog open={dialogAberto === index} onOpenChange={(open) => setDialogAberto(open ? index : null)}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={militares.length === 0}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold disabled:opacity-50 h-8 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Escalar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-green-800/30 text-white max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-400" />
                            Militar de Serviço - {item.dia}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getMilitaresOrdenados().map((militar) => {
                            const impedido = isMilitarImpedido(militar.id, item.data);
                            return (
                              <div
                                key={militar.id}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  impedido
                                    ? "bg-red-900/30 border-red-700/30 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-700/40 border-gray-600/30 hover:border-green-700/50"
                                }`}
                                onClick={() => !impedido && handleEscalarMilitar(index, militar.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                                    impedido ? "bg-gray-600" : "bg-gradient-to-br from-green-500 to-green-600"
                                  }`}>
                                    <span className="text-white font-bold text-sm">
                                      {militar.nome
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className={`font-medium ${impedido ? "text-gray-500" : "text-white"}`}>{militar.nome}</p>
                                    <p className={`text-xs ${impedido ? "text-gray-600" : "text-gray-400"}`}>{militar.patente}</p>
                                  </div>
                                  {impedido && (
                                    <Badge className="bg-red-700/50 text-red-200 border-red-600/50">Impedido</Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {/* Militar de Sobreaviso */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Sobreaviso</span>
                  </div>
                  {item.sobreaviso ? (
                    <div className="bg-gray-700/40 backdrop-blur-sm p-3 rounded-xl border border-blue-800/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {item.sobreaviso.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{item.sobreaviso.nome}</p>
                          <p className="text-gray-400 text-xs">{item.sobreaviso.patente}</p>
                        </div>
                        <Button
                          onClick={() => onRemoverSobreaviso(index)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-900/50 hover:bg-red-800/50 border-red-700/50 text-red-200 h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Dialog open={dialogSobreavisoAberto === index} onOpenChange={(open) => setDialogSobreavisoAberto(open ? index : null)}>
                      <DialogTrigger asChild>
                        <Button
                          disabled={militares.length === 0}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold disabled:opacity-50 h-8 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Escalar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-blue-800/30 text-white max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-400" />
                            Sobreaviso - {item.dia}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getMilitaresOrdenados().map((militar) => {
                            const impedido = isMilitarImpedido(militar.id, item.data);
                            return (
                              <div
                                key={militar.id}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  impedido
                                    ? "bg-red-900/30 border-red-700/30 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-700/40 border-gray-600/30 hover:border-blue-700/50"
                                }`}
                                onClick={() => !impedido && handleEscalarSobreaviso(index, militar.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                                    impedido ? "bg-gray-600" : "bg-gradient-to-br from-blue-500 to-blue-600"
                                  }`}>
                                    <span className="text-white font-bold text-sm">
                                      {militar.nome
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <p className={`font-medium ${impedido ? "text-gray-500" : "text-white"}`}>{militar.nome}</p>
                                    <p className={`text-xs ${impedido ? "text-gray-600" : "text-gray-400"}`}>{militar.patente}</p>
                                  </div>
                                  {impedido && (
                                    <Badge className="bg-red-700/50 text-red-200 border-red-600/50">Impedido</Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Resumo da Escala */}
      <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-400" />
            Resumo da Escala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm p-6 rounded-xl text-center border border-green-700/30">
              <p className="text-3xl font-bold text-green-300">{escala.filter((e) => e.militar).length}</p>
              <p className="text-gray-400 mt-1">Serviços Preenchidos</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm p-6 rounded-xl text-center border border-blue-700/30">
              <p className="text-3xl font-bold text-blue-300">{escala.filter((e) => e.sobreaviso).length}</p>
              <p className="text-gray-400 mt-1">Sobreavisos Preenchidos</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/40 backdrop-blur-sm p-6 rounded-xl text-center border border-gray-600/30">
              <p className="text-3xl font-bold text-gray-300">{escala.filter((e) => !e.militar).length}</p>
              <p className="text-gray-400 mt-1">Serviços Vagos</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm p-6 rounded-xl text-center border border-purple-700/30">
              <p className="text-3xl font-bold text-purple-300">{militares.length}</p>
              <p className="text-gray-400 mt-1">Total Militares</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
