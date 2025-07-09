"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Militar } from "../page"

interface Props {
  onAdicionar: (militar: Omit<Militar, "id">) => void
}

const patentes = [
  "Soldado",
  "Cabo",
  "3º Sargento",
  "2º Sargento",
  "1º Sargento",
  "Subtenente",
  "Aspirante",
  "2º Tenente",
  "1º Tenente",
  "Capitão",
  "Major",
  "Tenente Coronel",
  "Coronel",
]

export default function AdicionarMilitar({ onAdicionar }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    patente: "",
    matricula: "",
    diasFolga: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.nome && formData.patente && formData.matricula) {
      onAdicionar({
        ...formData,
        ultimoServico: null,
      })
      setFormData({ nome: "", patente: "", matricula: "", diasFolga: 0 })
      setIsOpen(false)
    }
  }

  return (
    <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            Adicionar Militar
          </CardTitle>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isOpen ? "Cancelar" : "Novo Militar"}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nome" className="text-gray-300 font-medium">
                    Nome Completo
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    className="bg-gray-700/50 border-green-800/30 text-white placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="matricula" className="text-gray-300 font-medium">
                    Matrícula
                  </Label>
                  <Input
                    id="matricula"
                    value={formData.matricula}
                    onChange={(e) => setFormData((prev) => ({ ...prev, matricula: e.target.value }))}
                    className="bg-gray-700/50 border-green-800/30 text-white placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20"
                    placeholder="Digite a matrícula"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="patente" className="text-gray-300 font-medium">
                    Patente
                  </Label>
                  <Select
                    value={formData.patente}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, patente: value }))}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-green-800/30 text-white focus:border-green-500/50">
                      <SelectValue placeholder="Selecione a patente" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-green-700/50">
                      {patentes.map((patente) => (
                        <SelectItem
                          key={patente}
                          value={patente}
                          className="text-white hover:bg-green-700/30 focus:bg-green-700/30"
                        >
                          {patente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="diasFolga" className="text-gray-300 font-medium">
                    Dias de Folga Inicial
                  </Label>
                  <Input
                    id="diasFolga"
                    type="number"
                    min="0"
                    value={formData.diasFolga}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, diasFolga: Number.parseInt(e.target.value) || 0 }))
                    }
                    className="bg-gray-700/50 border-green-800/30 text-white placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold flex-1 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Militar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </motion.div>
      )}
    </Card>
  )
}
