# Como funciona o novo sistema de PDF

## 📋 Dados que serão enviados da escala:

```json
{
  "periodo": "01 a 31 de julho de 2025",
  "dataGeracao": "08/07/2025",
  "horaGeracao": "16:13",
  "totalEscalados": 2,
  "totalVagos": 1,
  "totalMilitares": 3,
  "percentualPreenchimento": 67,
  "escala": [
    {
      "data": "2025-07-01",     // Data no formato YYYY-MM-DD
      "dia": "Terça",           // Dia da semana
      "militar": {              // Objeto completo do militar
        "id": 1,
        "nome": "Carlos Oliveira Lima",
        "patente": "Cb"
      },
      "sobreaviso": {           // Objeto completo do sobreaviso
        "id": 2,
        "nome": "João Silva Santos",
        "patente": "Sd"
      }
    },
    {
      "data": "2025-07-02",
      "dia": "Quarta",
      "militar": {
        "id": 2,
        "nome": "João Silva Santos",
        "patente": "Sd"
      },
      "sobreaviso": null        // Sem sobreaviso
    }
  ]
}
```

## 🎯 Como os dados aparecerão no PDF:

```
MINISTÉRIO DA DEFESA
EXÉRCITO BRASILEIRO
DEPARTAMENTO DE ENGENHARIA E CONSTRUÇÃO
DIRETORIA DE OBRAS DE COOPERAÇÃO

"PREVISÃO"
Período: 01 a 31 de julho de 2025

DATA     DIA DA SEMANA    MILITAR DE SERVIÇO      SOBREAVISO
01/07    Terça            Carlos Oliveira Lima    João Silva Santos
02/07    Quarta           João Silva Santos       
03/07    Quinta           
```

## ✅ Vantagens desta implementação:

1. **Cada dia na linha correta** - não haverá concatenação
2. **Data formatada** como DD/MM automaticamente
3. **Nomes completos** dos militares
4. **Linhas vazias** para dias sem escalação
5. **Baseado no modelo** escala.docx que você forneceu

## 🚀 Fluxo de uso:

1. Usuário escala militares na aba "Escala"
2. Vai para aba "PDF"
3. Clica em "Gerar PDF da Escala Militar"
4. Sistema converte dados + aplica no PDF
5. Download automático do arquivo formatado

Assim que o pdf-lib terminar de instalar, tudo funcionará perfeitamente!