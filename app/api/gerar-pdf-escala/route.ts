import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  let dadosEscala: any = null
  
  try {
    dadosEscala = await request.json()
    console.log('📋 Dados recebidos para PDF:', dadosEscala)

    // Para esta primeira versão, vou criar um PDF básico
    // Depois podemos implementar a conversão DOCX→PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const { width, height } = page.getSize()

    // Cabeçalho
    page.drawText('MINISTÉRIO DA DEFESA', {
      x: 50,
      y: height - 50,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('EXÉRCITO BRASILEIRO', {
      x: 50,
      y: height - 70,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('DEPARTAMENTO DE ENGENHARIA E CONSTRUÇÃO', {
      x: 50,
      y: height - 90,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    page.drawText('DIRETORIA DE OBRAS DE COOPERAÇÃO', {
      x: 50,
      y: height - 110,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    // Título da escala
    page.drawText('"PREVISÃO"', {
      x: 50,
      y: height - 150,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Período: ${dadosEscala.periodo || 'Não definido'}`, {
      x: 50,
      y: height - 170,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    // Cabeçalho da tabela
    const tableTop = height - 220
    page.drawText('DATA', {
      x: 50,
      y: tableTop,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('DIA DA SEMANA', {
      x: 120,
      y: tableTop,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('MILITAR DE SERVIÇO', {
      x: 230,
      y: tableTop,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('SOBREAVISO', {
      x: 380,
      y: tableTop,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    // Linha horizontal
    page.drawLine({
      start: { x: 50, y: tableTop - 5 },
      end: { x: 500, y: tableTop - 5 },
      thickness: 1,
      color: rgb(0, 0, 0),
    })

    // Dados da escala
    if (dadosEscala.escala && dadosEscala.escala.length > 0) {
      dadosEscala.escala.forEach((item: any, index: number) => {
        const yPosition = tableTop - 25 - (index * 20)
        
        // Formatar data para DD/MM
        const dataFormatada = item.data ? 
          new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }) : ''

        page.drawText(dataFormatada || '', {
          x: 50,
          y: yPosition,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(item.dia || '', {
          x: 120,
          y: yPosition,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(item.militar?.nome || '', {
          x: 230,
          y: yPosition,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(item.sobreaviso?.nome || '', {
          x: 380,
          y: yPosition,
          size: 9,
          font,
          color: rgb(0, 0, 0),
        })
      })
    }

    // Rodapé
    page.drawText('ARTHUR VITOR MARQUES DE SOUZA – 3° Sgt', {
      x: 50,
      y: 100,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText('Auxiliar de Gabinete da DOC', {
      x: 50,
      y: 80,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    // Gera o PDF
    const pdfBytes = await pdfDoc.save()

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