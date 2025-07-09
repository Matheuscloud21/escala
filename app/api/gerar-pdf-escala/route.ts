import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  let dadosEscala: any = null
  
  try {
    dadosEscala = await request.json()
    console.log('📋 Dados recebidos para PDF:', dadosEscala)

    // Criar PDF usando a estrutura do template HTML
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()

    // Telefone do Subdiretor (canto superior direito)
    page.drawText('Telefone do Subdiretor:', {
      x: 420,
      y: height - 30,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })
    page.drawText('61 996881722', {
      x: 440,
      y: height - 45,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    // Cabeçalho centralizado
    page.drawText('MINISTÉRIO DA DEFESA', {
      x: width / 2 - 90,
      y: height - 80,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('EXÉRCITO BRASILEIRO', {
      x: width / 2 - 80,
      y: height - 100,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('DEPARTAMENTO DE ENGENHARIA E CONSTRUÇÃO', {
      x: width / 2 - 140,
      y: height - 120,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    page.drawText('DIRETORIA DE OBRAS DE COOPERAÇÃO', {
      x: width / 2 - 120,
      y: height - 135,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    page.drawText('(Serviço de Obras e Fortificações do Exército/1946)', {
      x: width / 2 - 130,
      y: height - 150,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    })

    // Título da escala
    page.drawText('"PREVISÃO"', {
      x: width / 2 - 35,
      y: height - 180,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Período ${dadosEscala.periodo || 'não definido'}.`, {
      x: width / 2 - 80,
      y: height - 200,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    // Criar tabela EXATAMENTE como no HTML fornecido
    let currentY = height - 240
    
    // Primeira tabela com todas as linhas como no HTML original
    const tabelaLinhas = [
      // 1ª Semana
      { tipo: 'semana', texto: '1ª Semana', colspan: 4 },
      { tipo: 'cabecalho', colunas: ['Data', 'Dia', 'MILITAR DE SERVIÇO', 'SOBREAVISO'] },
      { tipo: 'linha', data: '01.JUL', dia: 'Terça-feira', militar: 'Cb RENNAN', sobreaviso: 'Cb OLIVEIRA' },
      { tipo: 'linha', data: '02.JUL', dia: 'Quarta-feira', militar: 'Cb OLIVEIRA', sobreaviso: 'Cb NETO' },
      { tipo: 'linha', data: '03.JUL', dia: 'Quinta-feira', militar: 'Cb UALACE', sobreaviso: 'Sd GOMES' },
      { tipo: 'linha', data: '04.JUL', dia: 'Sexta-feira', militar: 'Sd GOMES', sobreaviso: 'Cb NETO' },
      { tipo: 'fimSemana', data: '05.JUL', dia: 'Sábado', classe: 'sabado' },
      
      // 2ª Semana
      { tipo: 'semana', texto: '2ª Semana', colspan: 4 },
      { tipo: 'linha', data: '07.JUL', dia: 'Segunda-feira', militar: 'Cb NETO', sobreaviso: 'Cb OLIVEIRA' },
      { tipo: 'linha', data: '08.JUL', dia: 'Terça-feira', militar: 'Cb OLIVEIRA', sobreaviso: 'Cb UALACE' },
      { tipo: 'linha', data: '09.JUL', dia: 'Quarta-feira', militar: 'Cb UALACE', sobreaviso: 'Cb RENNAN' },
      { tipo: 'linha', data: '10.JUL', dia: 'Quinta-feira', militar: 'Cb RENNAN', sobreaviso: 'Sd GOMES' },
      { tipo: 'linha', data: '11.JUL', dia: 'Sexta-feira', militar: 'Sd GOMES', sobreaviso: 'Cb NETO' },
      { tipo: 'fimSemana', data: '12.JUL', dia: 'Sábado', classe: 'sabado' },
      
      // 3ª Semana
      { tipo: 'semana', texto: '3ª Semana', colspan: 4 },
      { tipo: 'linha', data: '15.JUL', dia: 'Terça-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '16.JUL', dia: 'Quarta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '17.JUL', dia: 'Quinta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '18.JUL', dia: 'Sexta-feira', militar: '', sobreaviso: '' },
      { tipo: 'fimSemana', data: '19.JUL', dia: 'Sábado', classe: 'sabado' },
      
      // 4ª Semana
      { tipo: 'semana', texto: '4ª Semana', colspan: 4 },
      { tipo: 'linha', data: '21.JUL', dia: 'Segunda-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '22.JUL', dia: 'Terça-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '23.JUL', dia: 'Quarta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '24.JUL', dia: 'Quinta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '25.JUL', dia: 'Sexta-feira', militar: '', sobreaviso: '' },
      { tipo: 'fimSemana', data: '26.JUL', dia: 'Sábado', classe: 'sabado' },
      
      // 5ª Semana
      { tipo: 'semana', texto: '5ª Semana', colspan: 4 },
      { tipo: 'linha', data: '28.JUL', dia: 'Segunda-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '29.JUL', dia: 'Terça-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '30.JUL', dia: 'Quarta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '31.JUL', dia: 'Quinta-feira', militar: '', sobreaviso: '' },
    ]

    // Agora substituir os dados vazios com os dados reais da escala
    const escalaItems = dadosEscala.escala || []
    let dataIndex = 0

    tabelaLinhas.forEach((linha, index) => {
      if (linha.tipo === 'linha' && dataIndex < escalaItems.length) {
        const dadoReal = escalaItems[dataIndex]
        if (dadoReal) {
          // Substituir com dados reais
          tabelaLinhas[index] = {
            ...linha,
            militar: dadoReal.militar?.nome || '',
            sobreaviso: dadoReal.sobreaviso?.nome || ''
          }
          dataIndex++
        }
      }
    })

    // Renderizar a tabela
    tabelaLinhas.forEach((linha) => {
      if (currentY < 80) return // Evitar sair da página

      if (linha.tipo === 'semana') {
        // Linha da semana (fundo amarelo)
        page.drawRectangle({
          x: 50,
          y: currentY - 5,
          width: 495,
          height: 20,
          color: rgb(0.96, 0.96, 0.33), // Amarelo
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        })

        page.drawText(linha.texto || '', {
          x: width / 2 - 30,
          y: currentY,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentY -= 25
      }
      else if (linha.tipo === 'cabecalho') {
        // Cabeçalhos da tabela (fundo amarelo)
        page.drawRectangle({
          x: 50,
          y: currentY - 5,
          width: 495,
          height: 20,
          color: rgb(0.96, 0.96, 0.33), // Amarelo
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        })

        page.drawText('Data', {
          x: 80,
          y: currentY,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        page.drawText('Dia', {
          x: 160,
          y: currentY,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        page.drawText('MILITAR DE SERVIÇO', {
          x: 250,
          y: currentY,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        page.drawText('SOBREAVISO', {
          x: 430,
          y: currentY,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentY -= 25
      }
      else if (linha.tipo === 'linha') {
        // Linha normal
        page.drawRectangle({
          x: 50,
          y: currentY - 5,
          width: 495,
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        })

        page.drawText(linha.data || '', {
          x: 70,
          y: currentY,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(linha.dia || '', {
          x: 140,
          y: currentY,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(linha.militar || '', {
          x: 250,
          y: currentY,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(linha.sobreaviso || '', {
          x: 430,
          y: currentY,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })

        currentY -= 20
      }
      else if (linha.tipo === 'fimSemana') {
        // Linha de fim de semana (fundo laranja)
        page.drawRectangle({
          x: 50,
          y: currentY - 5,
          width: 495,
          height: 20,
          color: rgb(0.86, 0.42, 0.06), // Laranja
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        })

        page.drawText(linha.data || '', {
          x: 70,
          y: currentY,
          size: 9,
          font,
          color: rgb(1, 1, 1), // Texto branco
        })

        page.drawText(linha.dia || '', {
          x: 140,
          y: currentY,
          size: 9,
          font,
          color: rgb(1, 1, 1), // Texto branco
        })

        // Campo mesclado (colspan="2")
        page.drawText('', {
          x: 250,
          y: currentY,
          size: 9,
          font,
          color: rgb(1, 1, 1),
        })

        currentY -= 20
      }
    })

    // Assinatura
    page.drawText('ARTHUR VITOR MARQUES DE SOUZA – 3º Sgt', {
      x: width / 2 - 120,
      y: 80,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('Auxiliar de Gabinete da DOC', {
      x: width / 2 - 70,
      y: 60,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    // Gerar o PDF
    const pdfBytes = await pdfDoc.save()

    console.log('✅ PDF gerado com sucesso!')

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=escala-permanencia-${new Date().toISOString().split('T')[0]}.pdf`,
      },
    })

  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao gerar PDF', 
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        dados: dadosEscala
      },
      { status: 500 }
    )
  }
}