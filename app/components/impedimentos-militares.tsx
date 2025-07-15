"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, Edit, Shield } from "lucide-react"

interface Impedimento {
  id: string
  dataInicio: string
  dataFim: string
  descricao: string
  militarId?: string // Opcional, se o impedimento for geral
  militarNome?: string // Para exibir o nome do militar
}

interface Props {
  impedimentos: Impedimento[]
  setImpedimentos: (impedimentos: Impedimento[]) => void
  militares: any[] // Passar a lista de militares para seleção
}

export default function ImpedimentosMilitares({ impedimentos, setImpedimentos, militares }: Props) {
  const [novaDescricao, setNovaDescricao] = useState("")
  const [novaDataInicio, setNovaDataInicio] = useState("") // Nova data de início
  const [novaDataFim, setNovaDataFim] = useState("") // Nova data de fim
  const [novoMilitarId, setNovoMilitarId] = useState("none") // Valor inicial "none"
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const adicionarImpedimento = () => {
    if (novaDescricao.trim() === "" || novaDataInicio.trim() === "" || novaDataFim.trim() === "") return

    const militarSelecionado = novoMilitarId === "none" ? undefined : militares.find(m => m.id === novoMilitarId);

    const novoImpedimento: Impedimento = {
      id: Date.now().toString(),
      dataInicio: novaDataInicio,
      dataFim: novaDataFim,
      descricao: novaDescricao,
      militarId: militarSelecionado ? novoMilitarId : undefined,
      militarNome: militarSelecionado ? militarSelecionado.nome : undefined,
    }
    setImpedimentos([...impedimentos, novoImpedimento])
    setNovaDescricao("")
    setNovaDataInicio("")
    setNovaDataFim("")
    setNovoMilitarId("none") // Definir como "none" após adicionar
  }

  const removerImpedimento = (id: string) => {
    setImpedimentos(impedimentos.filter((imp) => imp.id !== id))
  }

  const iniciarEdicao = (impedimento: Impedimento) => {
    setEditandoId(impedimento.id)
    setNovaDescricao(impedimento.descricao)
    setNovaDataInicio(impedimento.dataInicio)
    setNovaDataFim(impedimento.dataFim)
    setNovoMilitarId(impedimento.militarId || "none") // Definir como "none" se não houver militar
  }

  const salvarEdicao = () => {
    if (editandoId === null || novaDescricao.trim() === "" || novaDataInicio.trim() === "" || novaDataFim.trim() === "") return

    const militarSelecionado = novoMilitarId === "none" ? undefined : militares.find(m => m.id === novoMilitarId);

    setImpedimentos(
      impedimentos.map((imp) =>
        imp.id === editandoId
          ? {
              ...imp,
              dataInicio: novaDataInicio,
              dataFim: novaDataFim,
              descricao: novaDescricao,
              militarId: militarSelecionado ? novoMilitarId : undefined,
              militarNome: militarSelecionado ? militarSelecionado.nome : undefined,
            }
          : imp,
      ),
    )
    setEditandoId(null)
    setNovaDescricao("")
    setNovaDataInicio("")
    setNovaDataFim("")
    setNovoMilitarId("none") // Definir como "none" após editar
  }

  return (
    <Card className="bg-gray-800/60 backdrop-blur-sm border-green-800/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Shield className="h-6 w-6 text-green-400" />
          Impedimentos e Outros Assuntos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para adicionar/editar impedimento */}
        <div className="bg-gray-700/40 backdrop-blur-sm p-4 rounded-xl border border-green-800/20 space-y-4">
          <h4 className="text-white font-semibold">
            {editandoId ? "Editar Impedimento" : "Adicionar Novo Impedimento"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dataInicioImpedimento" className="text-gray-300">Data Início</Label>
              <Input
                id="dataInicioImpedimento"
                type="date"
                value={novaDataInicio}
                onChange={(e) => setNovaDataInicio(e.target.value)}
                className="bg-gray-900/50 border-green-700/50 text-white"
              />
            </div>
            <div>
              <Label htmlFor="dataFimImpedimento" className="text-gray-300">Data Fim</Label>
              <Input
                id="dataFimImpedimento"
                type="date"
                value={novaDataFim}
                onChange={(e) => setNovaDataFim(e.target.value)}
                className="bg-gray-900/50 border-green-700/50 text-white"
              />
            </div>
            <div>
              <Label htmlFor="militarImpedimento" className="text-gray-300">Militar (Opcional)</Label>
              <Select value={novoMilitarId} onValueChange={setNovoMilitarId}>
                <SelectTrigger className="w-full bg-gray-900/50 border-green-700/50 text-white">
                  <SelectValue placeholder="Selecione um militar" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-700">
                  <SelectItem value="none" className="text-gray-400">Nenhum militar específico</SelectItem>
                  {militares.map((militar) => (
                    <SelectItem key={militar.id} value={militar.id} className="text-white hover:bg-green-700/50">
                      {militar.nome} ({militar.patente})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="descricaoImpedimento" className="text-gray-300">Descrição</Label>
              <Textarea
                id="descricaoImpedimento"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Ex: Férias, Curso, Dispensa Médica, Missão"
                className="bg-gray-900/50 border-green-700/50 text-white"
              />
            </div>
          </div>
          <Button
            onClick={editandoId ? salvarEdicao : adicionarImpedimento}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
          >
            {editandoId ? (
              <>
                <Edit className="h-4 w-4 mr-2" /> Salvar Edição
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Impedimento
              </>
            )}
          </Button>
        </div>

        {/* Lista de impedimentos */}
        <div className="space-y-4">
          {impedimentos.length === 0 ? (
            <p className="text-gray-400 text-center">Nenhum impedimento registrado ainda.</p>
          ) : (
            impedimentos.map((impedimento) => (
              <div
                key={impedimento.id}
                className="bg-gray-700/50 backdrop-blur-sm p-4 rounded-xl border border-green-800/20 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-semibold">{impedimento.descricao}</p>
                  <p className="text-gray-400 text-sm">
                    Período: {new Date(impedimento.dataInicio + "T00:00:00").toLocaleDateString("pt-BR")} a {new Date(impedimento.dataFim + "T00:00:00").toLocaleDateString("pt-BR")}
                    {impedimento.militarNome && ` - Militar: ${impedimento.militarNome}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => iniciarEdicao(impedimento)} className="text-blue-400 border-blue-400 hover:bg-blue-900/30">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removerImpedimento(impedimento.id)} className="bg-red-900/50 hover:bg-red-800/50 border-red-700/50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}