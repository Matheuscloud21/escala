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

    // Função para centralizar texto automaticamente
    const getCenteredX = (text: string, fontSize: number, font: any) => {
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      return (width - textWidth) / 2
    }

    // Adicionar borda ao redor de todo o documento (conforme novo template)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    })

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

    // Carregar e inserir o brasão
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo-pdf.png')
      const logoImageBytes = fs.readFileSync(logoPath)
      const logoImage = await pdfDoc.embedPng(logoImageBytes)

      // Inserir brasão (80x80 como no HTML)
      page.drawImage(logoImage, {
        x: width / 2 - 40, // Centralizado
        y: height - 120,
        width: 80,
        height: 80,
      })
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar o brasão:', error)
    }

    // Cabeçalho centralizado automaticamente (ajustado para ficar abaixo do brasão)
    const texto1 = 'MINISTÉRIO DA DEFESA'
    page.drawText(texto1, {
      x: getCenteredX(texto1, 14, boldFont),
      y: height - 130,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    const texto2 = 'EXÉRCITO BRASILEIRO'
    page.drawText(texto2, {
      x: getCenteredX(texto2, 12, boldFont),
      y: height - 142,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    const texto3 = 'DEPARTAMENTO DE ENGENHARIA E CONSTRUÇÃO'
    page.drawText(texto3, {
      x: getCenteredX(texto3, 10, font),
      y: height - 154,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    const texto4 = 'DIRETORIA DE OBRAS DE COOPERAÇÃO'
    page.drawText(texto4, {
      x: getCenteredX(texto4, 10, font),
      y: height - 166,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    const texto5 = '(Serviço de Obras e Fortificações do Exército/1946)'
    page.drawText(texto5, {
      x: getCenteredX(texto5, 8, font),
      y: height - 178,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    })

    // Título da escala
    const texto6 = '"PREVISÃO"'
    page.drawText(texto6, {
      x: getCenteredX(texto6, 12, boldFont),
      y: height - 190,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    const texto7 = `Período ${dadosEscala.periodo || 'não definido'}.`
    page.drawText(texto7, {
      x: getCenteredX(texto7, 10, font),
      y: height - 202,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })

    // Ler o novo template HTML
    const templatePath = path.join(process.cwd(), 'templates', 'escala-nova.html')
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8')

    // Substituir o período no template
    htmlTemplate = htmlTemplate.replace('__PERIODO__', dadosEscala.periodo || 'não definido')

    // Organizar dados por semana
    const escalaItems = dadosEscala.escala || []

    // Agora vamos usar puppeteer se estiver disponível, caso contrário manter o PDF atual
    // Por enquanto, vou manter a geração PDF atual mas ajustar para usar a nova estrutura

    // Criar tabela com base no novo template HTML
    let currentY = height - 235 // Ajustado para dar espaço ao cabeçalho centralizado

    // Nova estrutura de tabela conforme especificações - semanas juntadas com domingo
    const tabelaLinhas = [
      // 1ª Semana
      { tipo: 'semana', texto: '1ª Semana' },
      { tipo: 'linha', data: '01 JUL', dia: 'Terça-feira', militar: '{{dado}}', sobreaviso: 'Cb OLIVEIRA' },
      { tipo: 'linha', data: '02 JUL', dia: 'Quarta-feira', militar: 'Cb OLIVEIRA', sobreaviso: 'Cb NETO' },
      { tipo: 'linha', data: '03 JUL', dia: 'Quinta-feira', militar: 'Cb UALACE', sobreaviso: 'Sd GOMES' },
      { tipo: 'linha', data: '04 JUL', dia: 'Sexta-feira', militar: 'Sd GOMES', sobreaviso: 'Cb NETO' },
      { tipo: 'fimSemana', data: '05 JUL', dia: 'Sábado' },
      { tipo: 'fimSemana', data: '06 JUL', dia: 'Domingo' },
      // 2ª Semana
      { tipo: 'semana', texto: '2ª Semana' },
      { tipo: 'linha', data: '07 JUL', dia: 'Segunda-feira', militar: 'Cb NETO', sobreaviso: 'Cb OLIVEIRA' },
      { tipo: 'linha', data: '08 JUL', dia: 'Terça-feira', militar: 'Cb OLIVEIRA', sobreaviso: 'Cb UALACE' },
      { tipo: 'linha', data: '09 JUL', dia: 'Quarta-feira', militar: 'Cb UALACE', sobreaviso: 'Cb RENNAN' },
      { tipo: 'linha', data: '10 JUL', dia: 'Quinta-feira', militar: 'Cb RENNAN', sobreaviso: 'Sd GOMES' },
      { tipo: 'linha', data: '11 JUL', dia: 'Sexta-feira', militar: 'Sd GOMES', sobreaviso: 'Cb NETO' },
      { tipo: 'fimSemana', data: '12 JUL', dia: 'Sábado' },
      { tipo: 'fimSemana', data: '13 JUL', dia: 'Domingo' },
      // 3ª Semana
      { tipo: 'semana', texto: '3ª Semana' },
      { tipo: 'linha', data: '14 JUL', dia: 'Segunda-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '15 JUL', dia: 'Terça-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '16 JUL', dia: 'Quarta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '17 JUL', dia: 'Quinta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '18 JUL', dia: 'Sexta-feira', militar: '', sobreaviso: '' },
      { tipo: 'fimSemana', data: '19 JUL', dia: 'Sábado' },
      { tipo: 'fimSemana', data: '20 JUL', dia: 'Domingo' },
      // 4ª Semana
      { tipo: 'semana', texto: '4ª Semana' },
      { tipo: 'linha', data: '21 JUL', dia: 'Segunda-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '22 JUL', dia: 'Terça-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '23 JUL', dia: 'Quarta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '24 JUL', dia: 'Quinta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '25 JUL', dia: 'Sexta-feira', militar: '', sobreaviso: '' },
      { tipo: 'fimSemana', data: '26 JUL', dia: 'Sábado' },
      { tipo: 'fimSemana', data: '27 JUL', dia: 'Domingo' },
      // 5ª Semana
      { tipo: 'semana', texto: '5ª Semana' },
      { tipo: 'linha', data: '28 JUL', dia: 'Segunda-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '29 JUL', dia: 'Terça-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '30 JUL', dia: 'Quarta-feira', militar: '', sobreaviso: '' },
      { tipo: 'linha', data: '31 JUL', dia: 'Quinta-feira', militar: '', sobreaviso: '' },
    ]

    // Substituir dados vazios com dados reais da escala
    let dataIndex = 0
    tabelaLinhas.forEach((linha, index) => {
      if ((linha.tipo === 'linha' || linha.tipo === 'fimSemana') && dataIndex < escalaItems.length) {
        const dadoReal = escalaItems[dataIndex]
        if (dadoReal) {
          tabelaLinhas[index] = {
            ...linha,
            militar: dadoReal.militar?.nome || '',
            sobreaviso: dadoReal.sobreaviso?.nome || ''
          }
          dataIndex++
        }
      }
    })

    // Definir larguras proporcionais: 15% (Data), 25% (Dia), 30% + 30% (Serviço/Sobreaviso)
    const larguraTotal = 495
    const colunas = {
      data: { x: 50, largura: larguraTotal * 0.15 }, // 15%
      dia: { x: 50 + larguraTotal * 0.15, largura: larguraTotal * 0.25 }, // 25%
      militar: { x: 50 + larguraTotal * 0.4, largura: larguraTotal * 0.3 }, // 30%
      sobreaviso: { x: 50 + larguraTotal * 0.7, largura: larguraTotal * 0.3 } // 30%
    }

    // Renderizar a tabela conforme especificações
    tabelaLinhas.forEach((linha) => {
      if (currentY < 80) return // Evitar sair da página

      if (linha.tipo === 'semana') {
        // Linha de semana: <td colspan="2">1ª Semana</td><td>MILITAR DE SERVIÇO</td><td>SOBREAVISO</td>

        // Fundo amarelo para toda a linha
        page.drawRectangle({
          x: colunas.data.x,
          y: currentY - 5,
          width: larguraTotal,
          height: 20,
          color: rgb(1, 1, 0), // #ffff00
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        })

        // Bordas internas verticais
        page.drawLine({
          start: { x: colunas.militar.x, y: currentY - 5 },
          end: { x: colunas.militar.x, y: currentY + 15 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })

        page.drawLine({
          start: { x: colunas.sobreaviso.x, y: currentY - 5 },
          end: { x: colunas.sobreaviso.x, y: currentY + 15 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })

        // Texto "1ª Semana" (colspan="2" - nas primeiras duas colunas)
        page.drawText(linha.texto || '', {
          x: colunas.data.x + (colunas.data.largura + colunas.dia.largura) / 2 - 30,
          y: currentY,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        // "MILITAR DE SERVIÇO"
        page.drawText('MILITAR DE SERVIÇO', {
          x: colunas.militar.x + 20,
          y: currentY,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        // "SOBREAVISO"
        page.drawText('SOBREAVISO', {
          x: colunas.sobreaviso.x + 30,
          y: currentY,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        currentY -= 20 // Reduzido para juntar as semanas
      }
      else if (linha.tipo === 'linha') {
        // Linha normal com 4 células
        page.drawRectangle({
          x: colunas.data.x,
          y: currentY - 5,
          width: larguraTotal,
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        })

        // Bordas internas verticais
        page.drawLine({
          start: { x: colunas.dia.x, y: currentY - 5 },
          end: { x: colunas.dia.x, y: currentY + 15 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })

        page.drawLine({
          start: { x: colunas.militar.x, y: currentY - 5 },
          end: { x: colunas.militar.x, y: currentY + 15 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })

        page.drawLine({
          start: { x: colunas.sobreaviso.x, y: currentY - 5 },
          end: { x: colunas.sobreaviso.x, y: currentY + 15 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })

        // Textos centralizados em cada célula
        page.drawText(linha.data || '', {
          x: colunas.data.x + colunas.data.largura / 2 - 15,
          y: currentY,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(linha.dia || '', {
          x: colunas.dia.x + colunas.dia.largura / 2 - 30,
          y: currentY,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(linha.militar || '', {
          x: colunas.militar.x + colunas.militar.largura / 2 - 25,
          y: currentY,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        })

        page.drawText(linha.sobreaviso || '', {
          x: colunas.sobreaviso.x + colunas.sobreaviso.largura / 2 - 25,
          y: currentY,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        })

        currentY -= 20
      }
      else if (linha.tipo === 'fimSemana') {
        // Linha de fim de semana: fundo #d97a00 (laranja), texto bold
        page.drawRectangle({
          x: colunas.data.x,
          y: currentY - 5,
          width: larguraTotal,
          height: 20,
          color: rgb(0.85, 0.48, 0), // #d97a00
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        })

        // Bordas internas verticais
        page.drawLine({
          start: { x: colunas.dia.x, y: currentY - 5 },
          end: { x: colunas.dia.x, y: currentY + 15 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })

        // Data e Dia
        page.drawText(linha.data || '', {
          x: colunas.data.x + colunas.data.largura / 2 - 15,
          y: currentY,
          size: 10,
          font: boldFont, // Bold para fins de semana
          color: rgb(1, 1, 1), // Texto branco
        })

        page.drawText(linha.dia || '', {
          x: colunas.dia.x + colunas.dia.largura / 2 - 30,
          y: currentY,
          size: 10,
          font: boldFont, // Bold para fins de semana
          color: rgb(1, 1, 1), // Texto branco
        })

        // Células 3 e 4 mescladas (colspan="2" nas últimas colunas)
        // Não precisa desenhar linha vertical entre militar e sobreaviso

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
        'Content-Disposition': `inline; filename=escala-permanencia-${new Date().toISOString().split('T')[0]}.pdf`,
      },   //"attachment" Para fazer download do pdf
      //"inline" Para abrir em uma nova aba sem download
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