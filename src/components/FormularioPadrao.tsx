"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

type TipoRequerimento =
  | "Alteração Cadastral Econômica"
  | "Atualização de Cadastro de Imóvel"
  | "Baixa de Inscrição Fiscal"
  | "Cancelamento de Dívida"
  | "Certidão Informativa"
  | "Compensação"
  | "Dedução Obra ISS"
  | "Denúncia Espontânea do ISSQN"
  | "Imunidade Autarquia e Fundação"
  | "Imunidade Entes Governamentais"
  | "Imunidade Entidade Educação e Assistência Social"
  | "Imunidade Entidade Sindical de Trabalhadores"
  | "Imunidade Partido Político"
  | "Imunidade Templo de Qualquer Culto"
  | "Inexigibilidade de Licença de Funcionamento"
  | "Isenção IPTU Ex-Soldado da Borracha ou Viúva"
  | "Isenção IPTU Ferroviário EFMM"
  | "Isenção IPTU/TRSD Bolsa Família"
  | "Isenção de Taxas de Poder de Polícia"
  | "Prescrição Tributária"
  | "Revalidação de Certificado Imunidade"
  | "Revisão de Área do Alvará ou da Publicidade"
  | "Suspensão de Atividade Econômica"
  | "";

type FormState = {
  tipoRequerimento: TipoRequerimento;

  nomeRazao: string;
  cpfCnpj: string;
  telefone: string;
  email: string;

  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  complemento: string;

  objetoPedido: string;

  cpfAssinatura: string;
};

const initialState: FormState = {
  tipoRequerimento: "",

  nomeRazao: "",
  cpfCnpj: "",
  telefone: "",
  email: "",

  logradouro: "",
  numero: "",
  bairro: "",
  cep: "",
  complemento: "",

  objetoPedido: "",

  cpfAssinatura: "",
};

const documentosPorTipo: Record<string, string[]> = {
  "Alteração Cadastral Econômica": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Para autônomo, documento comprobatório objeto da alteração",
    "Para sociedade civil, contrato social e consolidado",
  ],
  "Atualização de Cadastro de Imóvel": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço do requerente",
    "Comprovante de endereço do imóvel objeto do pedido",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Certidão de Inteiro teor atualizada; no caso de área registrada",
    "Contrato de compra e venda, quando for o caso",
    "Carnê do IPTU ou Informar o número da inscrição imobiliária",
    "Informar no requerimento qual e quando ocorreu alteração no imóvel",
    "Informar o número da inscrição imobiliária, se não houver carnê do IPTU",
  ],
  "Baixa de Inscrição Fiscal": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Para sociedade civil: distrato social, comprovante baixa do CNPJ",
    "Para profissional autônomo: contrato de trabalho, posse em concurso público e qualquer documento que comprove a cessação de prestação de serviço autônomo",
  ],
  "Cancelamento de Dívida": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Anexar documentação comprobatória",
    "Informar qual tipo de dívida, o ano, o valor e os motivos do cancelamento",
  ],
  "Certidão Informativa": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo e de certidão de qualquer natureza, com o comprovante original",
    "Informar no requerimento se deseja certidão de cadastro ou de baixa fiscal",
  ],
  Compensação: [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Anexar documentação comprobatória dos fatos",
    "Informar qual tipo de dívida, o ano, o valor e os motivos da compensação",
  ],
  "Dedução Obra ISS": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Cópia do contrato de prestação de serviço",
    "Planilha de custo - BDI",
    "Medição da obra objeto do pedido",
    "Notas de mercadorias",
    "Notas de remessa de materiais",
    "NFS-e já emitidas (somente se já emitiu NFS-e para a obra objeto do pedido)",
  ],
  "Denúncia Espontânea do ISSQN": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "DAM avulso (online) de denúncia espontânea do ISSQN, se houver valor denunciado",
    "Comprovante de pagamento do DAM avulso do ISSQN, se for o caso",
    "Redigir no requerimento ou em documento apartado toda a descrição dos fatos e das infrações que ensejaram a denúncia espontânea, as competências, os prazos, os valores, os cálculos de juros e multas conforme o Art. 87-A da LC 369/09",
  ],
  "Imunidade Autarquia e Fundação": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço da entidade",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Lei dispondo sobre a criação do órgão",
    "Regimento interno",
    "Decreto ou portaria de nomeação do representante",
    "Comprovante de inscrição no CNPJ",
    "Certidão de Inteiro Teor atualizada e dentro do prazo de validade em nome do requerente, ou contrato de compra e venda ou instrumento afim, nos casos em que a Certidão de Inteiro Teor não conste o nome do requerente, mas conste o nome do vendedor, para fins de concessão de ITBI",
    "Informar o número de inscrição imobiliária do imóvel objeto da imunidade, ou anexar o último carnê do IPTU",
  ],
  "Imunidade Entes Governamentais": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Lei dispondo sobre a criação do órgão",
    "Decreto ou portaria de nomeação do representante",
    "Comprovante de inscrição no CNPJ",
    "Certidão de Inteiro Teor atualizada e dentro do prazo de validade em nome do requerente, ou contrato de compra e venda ou instrumento afim, nos casos em que a Certidão de Inteiro Teor não conste o nome do requerente, mas conste o nome do vendedor, para fins de concessão de ITBI",
    "Informar o número de inscrição imobiliária do imóvel objeto da imunidade, ou anexar o último carnê do IPTU",
  ],
  "Imunidade Entidade Educação e Assistência Social": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Atestado de registro no Conselho Nacional de Assistência Social (CNAS) ou certificado de entidade de fins filantrópicos expedido pelo CNAS (no caso de entidade de assistência social)",
    "Registro no Ministério da Educação ou na Secretaria Estadual da Educação (no caso de entidade de educação)",
    "Atos constitutivos",
    "Comprovante de inscrição no CNPJ",
    "Certidão de Inteiro Teor atualizada e dentro do prazo de validade em nome do requerente, ou contrato de compra e venda ou instrumento afim, nos casos em que a Certidão de Inteiro Teor não conste o nome do requerente, mas conste o nome do vendedor, para fins de concessão de ITBI",
    "Informar o número de inscrição imobiliária do imóvel objeto da imunidade, ou anexar o último carnê do IPTU",
  ],
  "Imunidade Entidade Sindical de Trabalhadores": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Regimento interno",
    "Comprovante de inscrição no CNPJ",
    "Certidão de Inteiro Teor atualizada e dentro do prazo de validade em nome do requerente, ou contrato de compra e venda ou instrumento afim, nos casos em que a Certidão de Inteiro Teor não conste o nome do requerente, mas conste o nome do vendedor, para fins de concessão de ITBI",
    "Informar o número de inscrição imobiliária do imóvel objeto da imunidade, se não houver carnê do IPTU",
  ],
  "Imunidade Partido Político": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Lei federal dispondo sobre sua criação",
    "Registro no Tribunal Superior Eleitoral",
    "Regimento interno",
    "Comprovante de inscrição no CNPJ",
    "Certidão de Inteiro Teor atualizada e dentro do prazo de validade em nome do requerente, ou contrato de compra e venda ou instrumento afim, nos casos em que a Certidão de Inteiro Teor não conste o nome do requerente, mas conste o nome do vendedor, para fins de concessão de ITBI",
    "Informar o número de inscrição imobiliária do imóvel objeto da imunidade, ou anexar o último carnê do IPTU",
  ],
  "Imunidade Templo de Qualquer Culto": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF do requerente e seu procurador, se for o caso",
    "Cópia do Comprovante de endereço do requerente",
    "Confirmar e-mail e telefones de contato no requerimento. Adicionar outros meios de contato no campo observação, se necessário",
    "Taxa de abertura de processo, com o comprovante de pagamento original",
    "Estatuto ou Regimento interno",
    "Ata de Criação da entidade",
    "Ata da última diretoria eleita",
    "Comprovante de inscrição no CNPJ",
    "Ata de Filiação de Unidades Religiosas (somente para situações em que um único CNPJ, esteja sendo utilizado para representar várias unidades pertencentes à mesma organização religiosa)",
    "Certidão de Inteiro Teor atualizada e dentro do prazo de validade em nome do requerente, ou contrato de compra e venda ou instrumento afim, nos casos em que a Certidão de Inteiro Teor não conste o nome do requerente, mas conste o nome do vendedor, para fins de concessão de ITBI",
    "Informar o número de inscrição imobiliária do imóvel objeto da imunidade, ou anexar o último carnê do IPTU",
  ],
  "Inexigibilidade de Licença de Funcionamento": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Último Alvará",
    "Cartão do CNPJ",
    "Última alteração contratual, se for empresa",
    "Informar qual norma garante o direito à inexigibilidade de licença de funcionamento",
  ],
  "Isenção IPTU Ex-Soldado da Borracha ou Viúva": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Carta de concessão do benefício, expedida pelo INSS ou justificação expedida pelo Ministério Público",
    "Certidão de óbito (no caso de cônjuge sobrevivente)",
    "Informar o número de inscrição imobiliária do imóvel objeto da isenção, se não houver carnê do IPTU",
  ],
  "Isenção IPTU Ferroviário EFMM": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Certidão fornecida pelo Ministério dos Transportes ou Carteira de Trabalho e Previdência Social ou documento de identificação de entidade classista",
    "Certidão de óbito (no caso de cônjuge sobrevivente)",
    "Informar o número de inscrição imobiliária do imóvel objeto da isenção, se não houver carnê do IPTU",
  ],
  "Isenção IPTU/TRSD Bolsa Família": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Taxa de abertura de processo, com o comprovante original",
    "Informar e-mail e telefones de contato",
    "Carnê de IPTU e TRSD, ou, 2ª via do Documento de Arrecadação Municipal (DAM) do exercício em que solicita a isenção",
    "Contrato de compra e Venda do Imóvel (se o imóvel for próprio), ou de aluguel (se for alugado) ou de Cessão ou Direito de Uso (se for cedido) - documentos exigidos para situações em que o imóvel não esteja em nome do beneficiário do Programa Bolsa Família",
    "Certidão de Casamento ou Declaração de União Estável para situações em que o imóvel está em nome de um cônjuge e o benefício está em nome do outro cônjuge",
    "Relatório analítico de domicílios e pessoas cadastradas, incluindo o Número da Identificação Social (NIS), Nome do beneficiário, Situação Cadastral, e Renda per capta a ser juntado pela SEMAS",
    "Relatório Analítico do Sistema de Benefícios Cidadão (SIBEC) a ser juntado pela SEMAS",
    "Despacho emitido pelas SEMAS se faz jus ou não benefício",
  ],
  "Isenção de Taxas de Poder de Polícia": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "RG e CPF do requerente e seu procurador, se for o caso",
    "Comprovante de inscrição no CNPJ",
    "Comprovante de endereço do requerente e da entidade",
    "Informar e-mail e telefones de contato no requerimento",
    "Taxa de abertura de processo, com o comprovante de pagamento original",
    "Lei, Estatuto ou Regimento interno da entidade",
  ],
  "Prescrição Tributária": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Para imóvel, cópia do contrato de compra e venda, caso o IPTU/TRSD não esteja no nome do proprietário",
    "Informar no requerimento os tributos e os respectivos anos a prescrever da mesma inscrição",
  ],
  "Revalidação de Certificado Imunidade": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Certificado Declaratório de Imunidade a ser revalidado (original ou cópia)",
  ],
  "Revisão de Área do Alvará ou da Publicidade": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Anexar o Alvará original, se houver",
    "Anexar foto, croqui, e qualquer documento que comprove o tamanho da área correta",
    "Informar o número de ROP na solicitação, se alvará em processo de licenciamento",
    "Descrever no requerimento o motivo da revisão, inclusive se houve erro na declaração de metragem pela REDESIM, comprovando a área correta com croqui, foto, mapa etc.",
    "Informar no requerimento o horário para vistoria",
  ],
  "Suspensão de Atividade Econômica": [
    "Requerimento padrão, devidamente assinado pelo requerente ou seu procurador",
    "Cópia de RG e CPF, do requerente",
    "Comprovante de endereço",
    "Informar e-mail e telefones de contato",
    "Taxa de abertura de processo, com o comprovante original",
    "Comprovante de suspensão da JUCER, para empresas",
    "Comprovante de suspensão do CNPJ, para pessoas jurídicas",
    "Comprovante pagamento ISS do mês do pedido, para autônomo e sociedade de profissionais",
    "Informar no requerimento os motivos da suspensão",
  ],
};

function splitLongText(text: string, maxLength = 1800) {
  const clean = text.trim();
  if (!clean) return [""];

  const paragraphs = clean.split(/\n+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (paragraph.length <= maxLength) {
      current = paragraph;
      continue;
    }

    for (let i = 0; i < paragraph.length; i += maxLength) {
      chunks.push(paragraph.slice(i, i + maxLength));
    }
  }

  if (current) chunks.push(current);

  return chunks.length ? chunks : [""];
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = digitsOnly(value).slice(0, 11);
  let v = digits;
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
}

function formatCnpj(value: string) {
  const digits = digitsOnly(value).slice(0, 14);
  let v = digits;
  v = v.replace(/^(\d{2})(\d)/, "$1.$2");
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
  v = v.replace(/(\d{4})(\d)/, "$1-$2");
  return v;
}

function formatCpfCnpj(value: string) {
  const digits = digitsOnly(value);
  if (digits.length <= 11) return formatCpf(digits);
  return formatCnpj(digits);
}

function formatCep(value: string) {
  const digits = digitsOnly(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, "$1-$2");
}

function formatTelefone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length >= 9) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
  }
  if (rest.length >= 8) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
  }
  return `(${ddd}) ${rest}`;
}

function isValidCpfCnpjLength(value: string) {
  const len = digitsOnly(value).length;
  return len === 11 || len === 14;
}

function isValidCpfLength(value: string) {
  return digitsOnly(value).length === 11;
}

function isValidCep(value: string) {
  return digitsOnly(value).length === 8;
}

function isValidPhoneBR(value: string) {
  const len = digitsOnly(value).length;
  return len === 10 || len === 11;
}

function formatarDataExtensoPVH() {
  const meses = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const d = new Date();
  return `Porto Velho, ${d.getDate()} de ${mesesesSafe(meses, d.getMonth())} de ${d.getFullYear()}`;
}

function mesesesSafe(meses: string[], idx: number) {
  return meses[idx] ?? "";
}

/** ======= COMPONENTES (mesma base / sem alterar estilos) ======= */

function SectionCard({
  title,
  children,
  muted = false,
}: {
  title: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section
      className={`mb-8 overflow-hidden rounded-lg border border-gray-200 ${
        muted ? "bg-[#f5f5f5]" : "bg-white"
      }`}
    >
      <h5
        className={`px-4 py-2 text-sm font-bold md:text-base ${
          muted ? "bg-gray-200 text-[#1e3a5f]" : "bg-[#f5f5f5] text-[#1e3a5f]"
        }`}
      >
        {title}
      </h5>
      {children}
    </section>
  );
}

function InputField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly = false,
  invalid = false,
  className = "",
  inputClassName = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  invalid?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`mb-1 block text-sm font-semibold ${
          invalid ? "text-red-700" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
          readOnly ? "cursor-not-allowed bg-gray-100" : "bg-white"
        } ${
          invalid
            ? "border-red-400 bg-red-50"
            : "border-gray-300 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
        } ${inputClassName}`}
      />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  invalid = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1 block text-sm font-semibold ${
          invalid ? "text-red-700" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        rows={6}
        placeholder={placeholder}
        className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
          invalid
            ? "border-red-400 bg-red-50"
            : "border-gray-300 bg-white focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
        }`}
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  invalid = false,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1 block text-sm font-semibold ${
          invalid ? "text-red-700" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`w-full rounded border px-3 py-2 text-sm outline-none transition ${
          invalid
            ? "border-red-400 bg-red-50"
            : "border-gray-300 bg-white focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
        }`}
      >
        {children}
      </select>
    </div>
  );
}

const pdfHeaderStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: "18px",
  borderBottom: "2px solid #333",
  paddingBottom: "12px",
};

const pdfTitleStyle: CSSProperties = {
  fontSize: "17pt",
  marginBottom: "6px",
  color: "#000",
  fontWeight: 700,
};

const pdfSubTitleStyle: CSSProperties = {
  fontSize: "13pt",
  marginBottom: "4px",
  fontWeight: 400,
  color: "#333",
};

const pdfHeaderTextStyle: CSSProperties = {
  fontSize: "9pt",
  color: "#666",
};

const pdfSectionTitleStyle: CSSProperties = {
  background: "#333",
  color: "#fff",
  padding: "0 0 15px 5px",
  margin: "12px 0 8px 0",
  fontSize: "11pt",
  fontWeight: 700,
};

const pdfFieldLineStyle: CSSProperties = {
  marginBottom: "6px",
  lineHeight: 1.6,
};

const pdfParagraphStyle: CSSProperties = {
  marginBottom: "10px",
  textAlign: "justify",
};

const pdfHrStyle: CSSProperties = {
  border: "none",
  borderTop: "1px solid #333",
  margin: "15px 0",
};

const pdfSignatureAreaStyle: CSSProperties = {
  marginTop: "35px",
  textAlign: "center",
};

const pdfSignatureLineStyle: CSSProperties = {
  borderTop: "1px solid #000",
  width: "300px",
  margin: "95px auto 8px",
};

const TIMBRADO_HEADER_SRC = "/semec-timbrado-cabecalho.png";
const TIMBRADO_FOOTER_SRC = "/semec-timbrado-rodape.png";

const pdfPaperStyle: CSSProperties = {
  position: "relative",
  width: "210mm",
  minHeight: "310mm",
  height: "310mm",
  background: "#ffffff",
  overflow: "hidden",
};

const HEADER_SPACE = "28mm";
const FOOTER_SPACE = "26mm";

const pdfTimbradoHeaderStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: HEADER_SPACE,
  zIndex: 1,
};

const pdfTimbradoHeaderImgStyle: CSSProperties = {
  width: "100%",
  display: "block",
};

const pdfTimbradoFooterStyle: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: FOOTER_SPACE,
  zIndex: 1,
};

const pdfTimbradoFooterImgStyle: CSSProperties = {
  width: "100%",
  display: "block",
};

const pdfContentLayerStyle: CSSProperties = {
  position: "relative",
  zIndex: 2,
  boxSizing: "border-box",
  width: "190mm",
  paddingTop: `calc(${HEADER_SPACE} + 2mm)`,
  paddingBottom: `calc(${FOOTER_SPACE} + 6mm)`,
  margin: "0 auto",
  background: "transparent",
  fontFamily: "Arial, sans-serif",
  fontSize: "10.5pt",
  lineHeight: 1.4,
  color: "#000000",
};

function PdfPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="pdf-page" style={pdfPaperStyle}>
      <div style={pdfTimbradoHeaderStyle}>
        <img
          src={TIMBRADO_HEADER_SRC}
          alt=""
          style={pdfTimbradoHeaderImgStyle}
        />
      </div>

      <div style={pdfTimbradoFooterStyle}>
        <img
          src={TIMBRADO_FOOTER_SRC}
          alt=""
          style={pdfTimbradoFooterImgStyle}
        />
      </div>

      <div style={pdfContentLayerStyle}>{children}</div>
    </div>
  );
}

/** ======= COMPONENTE FINAL ======= */

export default function RequerimentoSemfazForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const pdfRef = useRef<HTMLDivElement>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date());
  }, []);

  const dataExtenso = useMemo(() => formatarDataExtensoPVH(), []);

  const documentosNecessarios = useMemo(() => {
    if (!form.tipoRequerimento) return null;
    const docs = documentosPorTipo[form.tipoRequerimento] ?? [];
    return docs.length ? docs : [];
  }, [form.tipoRequerimento]);

  const objetoChunks = useMemo(
    () => splitLongText(form.objetoPedido, 1700),
    [form.objetoPedido],
  );

  function isInvalidField(field: string) {
    return invalidFields.includes(field);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;

    // máscaras (mantém visual do input, sem mudar estilos)
    if (name === "cpfCnpj") {
      setForm((prev) => ({ ...prev, cpfCnpj: formatCpfCnpj(value) }));
      return;
    }

    if (name === "cpfAssinatura") {
      setForm((prev) => ({ ...prev, cpfAssinatura: formatCpf(value) }));
      return;
    }

    if (name === "cep") {
      setForm((prev) => ({ ...prev, cep: formatCep(value) }));
      return;
    }

    if (name === "telefone") {
      setForm((prev) => ({ ...prev, telefone: formatTelefone(value) }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      tipoRequerimento: value as TipoRequerimento,
    }));
  }

  function scrollToFirstError(fieldIds: string[]) {
    const first = fieldIds[0];
    if (!first) return;

    const el = document.getElementById(first);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if ("focus" in el && typeof (el as HTMLElement).focus === "function") {
        (el as HTMLElement).focus();
      }
    }
  }

  function validateForm() {
    const errors: string[] = [];
    const fields: string[] = [];
    const emailRegex = /^\S+@\S+\.\S+$/;

    function addFieldError(field: keyof FormState, message: string) {
      errors.push(message);
      fields.push(String(field));
    }

    function required(field: keyof FormState, label: string) {
      const value = String(form[field] ?? "").trim();
      if (!value) addFieldError(field, `O campo "${label}" é obrigatório.`);
    }

    required("tipoRequerimento", "Tipo de requerimento");
    required("nomeRazao", "Nome/Razão social");
    required("cpfCnpj", "CPF/CNPJ");
    required("telefone", "Telefone/Celular");
    required("email", "E-mail");
    required("logradouro", "Endereço de Correspondência");
    required("numero", "Nº");
    required("bairro", "Bairro");
    required("cep", "CEP");
    required("objetoPedido", "Objeto do pedido");
    required("cpfAssinatura", "CPF nº (Assinatura)");

    if (form.email.trim() && !emailRegex.test(form.email.trim())) {
      addFieldError("email", `"E-mail" não é um e-mail válido.`);
    }

    if (form.cpfCnpj.trim() && !isValidCpfCnpjLength(form.cpfCnpj)) {
      addFieldError(
        "cpfCnpj",
        `"CPF/CNPJ" deve conter 11 dígitos (CPF) ou 14 dígitos (CNPJ).`,
      );
    }

    if (form.telefone.trim() && !isValidPhoneBR(form.telefone)) {
      addFieldError(
        "telefone",
        `"Telefone/Celular" deve conter 10 ou 11 dígitos.`,
      );
    }

    if (form.cep.trim() && !isValidCep(form.cep)) {
      addFieldError("cep", `"CEP" deve conter 8 dígitos.`);
    }

    if (form.cpfAssinatura.trim() && !isValidCpfLength(form.cpfAssinatura)) {
      addFieldError("cpfAssinatura", `"CPF nº" deve conter 11 dígitos.`);
    }

    const uniqueFields = [...new Set(fields)];
    setInvalidFields(uniqueFields);
    setValidationErrors(errors);

    if (errors.length > 0) {
      requestAnimationFrame(() => scrollToFirstError(uniqueFields));
      return false;
    }

    return true;
  }

  async function generatePdf() {
    if (!validateForm()) return;

    if (!pdfRef.current) {
      alert("Erro ao preparar o conteúdo do PDF.");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => setTimeout(() => resolve(), 300));
      });

      const images = Array.from(
        pdfRef.current.querySelectorAll("img"),
      ) as HTMLImageElement[];

      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );

      const pages = pdfRef.current.querySelectorAll<HTMLElement>(".pdf-page");
      if (!pages.length)
        throw new Error("Nenhuma página do PDF foi encontrada.");

      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: pages[i].scrollWidth,
          height: pages[i].scrollHeight,
          windowWidth: pages[i].scrollWidth,
          windowHeight: pages[i].scrollHeight,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      pdf.save("Requerimento_SEMFAZ.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert(
        `Erro ao gerar PDF: ${error instanceof Error ? error.message : "erro desconhecido"}`,
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <>
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-[5px] border-white/30 border-t-[#70B643]" />
            <h2 className="text-xl font-bold">Gerando PDF...</h2>
            <p className="mt-2 text-sm text-white/80">
              Por favor, aguarde alguns instantes
            </p>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg md:p-10">
          {validationErrors.length > 0 && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
              <p className="mb-2 font-bold text-red-700">
                Corrija os seguintes erros:
              </p>
              <ul className="ml-5 list-disc text-sm text-red-600">
                {validationErrors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <h4 className="mb-8 text-center text-xl font-bold text-[#70B643] md:text-2xl">
            REQUERIMENTO PADRÃO - SEMFAZ
          </h4>

          <p className="mb-6 text-sm leading-6 text-gray-700 md:text-base">
            Ilmo. Sr. (a) Secretário (a) Municipal de Fazenda (SEMFAZ), trata-se
            de:
          </p>

          <SectionCard title="TIPO DE REQUERIMENTO">
            <div className="p-4">
              <SelectField
                id="tipoRequerimento"
                label="Selecione o tipo de requerimento"
                value={form.tipoRequerimento}
                onChange={handleSelectChange}
                invalid={isInvalidField("tipoRequerimento")}
              >
                <option value="" disabled>
                  Selecione o tipo de requerimento
                </option>
                {Object.keys(documentosPorTipo).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </SelectField>

              {form.tipoRequerimento && (
                <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-bold text-[#1e3a5f]">
                    Documentos Necessários:
                  </p>

                  {documentosNecessarios && documentosNecessarios.length > 0 ? (
                    <ul className="ml-5 list-disc space-y-1 text-sm text-gray-700">
                      {documentosNecessarios.map((doc, idx) => (
                        <li key={`${doc}-${idx}`}>{doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-gray-600">
                      Nenhum documento obrigatório cadastrado para este tipo de
                      requerimento.
                    </p>
                  )}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="1. IDENTIFICAÇÃO DO SUJEITO PASSIVO/REQUERENTE">
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
              <InputField
                id="nomeRazao"
                label="Nome/Razão social"
                value={form.nomeRazao}
                onChange={handleChange}
                placeholder="Digite o nome completo ou razão social"
                invalid={isInvalidField("nomeRazao")}
                className="md:col-span-2"
              />

              <InputField
                id="cpfCnpj"
                label="CPF/CNPJ"
                value={form.cpfCnpj}
                onChange={handleChange}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                invalid={isInvalidField("cpfCnpj")}
              />

              <InputField
                id="telefone"
                label="Telefone/Celular"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                invalid={isInvalidField("telefone")}
              />

              <InputField
                id="email"
                label="E-mail"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="exemplo@email.com"
                invalid={isInvalidField("email")}
                className="md:col-span-2"
              />

              <InputField
                id="logradouro"
                label="Endereço de Correspondência"
                value={form.logradouro}
                onChange={handleChange}
                placeholder="Digite o endereço completo"
                invalid={isInvalidField("logradouro")}
                className="md:col-span-2"
              />

              <InputField
                id="numero"
                label="Nº"
                value={form.numero}
                onChange={handleChange}
                placeholder="Número"
                invalid={isInvalidField("numero")}
              />

              <InputField
                id="bairro"
                label="Bairro"
                value={form.bairro}
                onChange={handleChange}
                placeholder="Digite o bairro"
                invalid={isInvalidField("bairro")}
              />

              <InputField
                id="cep"
                label="CEP"
                value={form.cep}
                onChange={handleChange}
                placeholder="00000-000"
                invalid={isInvalidField("cep")}
              />

              <InputField
                id="complemento"
                label="Complemento"
                value={form.complemento}
                onChange={handleChange}
                placeholder="Apartamento, bloco, etc."
              />
            </div>
          </SectionCard>

          <SectionCard title="2. O SUJEITO PASSIVO ACIMA IDENTIFICADO VEM REQUERER:">
            <div className="p-4">
              <TextAreaField
                id="objetoPedido"
                label="Objeto do pedido"
                value={form.objetoPedido}
                onChange={handleChange}
                placeholder="Descreva de forma legível o objeto do pedido, com a devida motivação e quaisquer outras razões necessárias à análise do pleito"
                invalid={isInvalidField("objetoPedido")}
              />
            </div>
          </SectionCard>

          <SectionCard title="ASSINATURA" muted>
            <div className="p-4">
              <p className="mb-4 text-sm text-gray-700">
                Sujeito passivo/Requerente (inclusive assinatura eletrônica){" "}
                <a
                  href="https://www.gov.br/pt-br/servicos/assinatura-eletronica"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#26476f] underline"
                >
                  Clique Aqui
                </a>{" "}
                e assine pelo Gov.br
              </p>

              <InputField
                id="cpfAssinatura"
                label="CPF nº"
                value={form.cpfAssinatura}
                onChange={handleChange}
                placeholder="000.000.000-00"
                invalid={isInvalidField("cpfAssinatura")}
                inputClassName="max-w-[320px]"
              />

              <p className="mt-6 text-right text-sm text-gray-700">
                {dataExtenso}
              </p>
            </div>
          </SectionCard>

          <div className="mb-4 space-y-1 text-center text-xs text-gray-500">
            <p>Documento gerado eletronicamente em {currentDate}</p>
          </div>

          <div className="pb-4 text-center">
            <button
              type="button"
              onClick={generatePdf}
              className="rounded-full bg-[#70B643] px-8 py-3 font-bold text-white shadow-lg transition duration-300 ease-in-out hover:scale-[1.02] hover:bg-[#5ea637] focus:outline-none focus:ring-2 focus:ring-[#70B643]/50"
            >
              Gerar e Imprimir PDF
            </button>
          </div>
        </div>
      </section>

      {/* PDF invisível */}
      <div
        ref={pdfRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          zIndex: -1,
        }}
      >
        {/* Página 1: Header + Seção 1 + Seção 2 (primeiro chunk) */}
        <PdfPageFrame>
          <div style={pdfHeaderStyle}>
            <div style={pdfTitleStyle}>
              PREFEITURA DO MUNICÍPIO DE PORTO VELHO
            </div>
            <div style={pdfSubTitleStyle}>SECRETARIA MUNICIPAL DE FAZENDA</div>
            <p style={pdfHeaderTextStyle}>REQUERIMENTO</p>
          </div>

          <p style={pdfParagraphStyle}>
            <strong>
              Ilmo. Sr. (a) Secretário (a) Municipal de Fazenda (SEMFAZ),
              trata-se de:
            </strong>
          </p>

          <div style={pdfFieldLineStyle}>
            <strong>Tipo de requerimento:</strong>{" "}
            {form.tipoRequerimento || "-"}
          </div>

          <div style={pdfSectionTitleStyle}>
            1. IDENTIFICAÇÃO DO SUJEITO PASSIVO/REQUERENTE
          </div>

          <div style={pdfFieldLineStyle}>
            <strong>Nome/Razão social:</strong> {form.nomeRazao}
          </div>
          <div style={pdfFieldLineStyle}>
            <strong>CPF/CNPJ:</strong> {form.cpfCnpj}
          </div>
          <div style={pdfFieldLineStyle}>
            <strong>Telefone/Celular:</strong> {form.telefone}
          </div>
          <div style={pdfFieldLineStyle}>
            <strong>E-mail:</strong> {form.email}
          </div>
          <div style={pdfFieldLineStyle}>
            <strong>Endereço de Correspondência:</strong> {form.logradouro}
          </div>
          <div style={pdfFieldLineStyle}>
            <strong>Nº:</strong> {form.numero} &nbsp;&nbsp;
            <strong>Bairro:</strong> {form.bairro}
          </div>
          <div style={pdfFieldLineStyle}>
            <strong>CEP:</strong> {form.cep} &nbsp;&nbsp;
            <strong>Complemento:</strong> {form.complemento || "-"}
          </div>

          <div style={pdfSectionTitleStyle}>
            2. O SUJEITO PASSIVO ACIMA IDENTIFICADO VEM REQUERER:
          </div>

          <p style={{ ...pdfParagraphStyle, whiteSpace: "pre-line" }}>
            {objetoChunks[0] ?? ""}
          </p>
        </PdfPageFrame>

        {/* Páginas extras (continuação do pedido) */}
        {objetoChunks.slice(1).map((chunk, idx) => (
          <PdfPageFrame key={`pdf-obj-${idx}`}>
            <div style={pdfHeaderStyle}>
              <div style={pdfTitleStyle}>REQUERIMENTO</div>
              <div style={pdfSubTitleStyle}>Continuação do pedido</div>
              <p style={pdfHeaderTextStyle}>SEMFAZ - Porto Velho</p>
            </div>

            <div style={pdfSectionTitleStyle}>
              CONTINUAÇÃO - OBJETO DO PEDIDO
            </div>

            <p style={{ ...pdfParagraphStyle, whiteSpace: "pre-line" }}>
              {chunk}
            </p>
          </PdfPageFrame>
        ))}

        {/* Última página: encerramento/assinatura (sempre) */}
        <PdfPageFrame>
          <div style={pdfHeaderStyle}>
            <div style={pdfTitleStyle}>REQUERIMENTO</div>
            <div style={pdfSubTitleStyle}>Encerramento</div>
            <p style={pdfHeaderTextStyle}>SEMFAZ - Porto Velho</p>
          </div>

          <p style={{ ...pdfParagraphStyle, textAlign: "center" }}>
            Nestes termos, pede deferimento.
          </p>

          <p style={{ ...pdfParagraphStyle, textAlign: "center" }}>
            {dataExtenso}
          </p>

          <div style={pdfHrStyle} />

          <div style={pdfSignatureAreaStyle}>
            <div style={pdfSignatureLineStyle} />
            <strong>Sujeito passivo/Requerente</strong>
            <br />
            CPF nº {form.cpfAssinatura}
          </div>

          <div style={pdfHrStyle} />

          <p style={{ fontSize: "9pt" }}>
            Documento gerado eletronicamente em {currentDate}.
          </p>
        </PdfPageFrame>
      </div>
    </>
  );
}
