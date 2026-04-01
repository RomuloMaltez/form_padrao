"use client";

import { useMemo, useState, type CSSProperties } from "react";
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

/** ======= COMPONENTE FINAL ======= */

export default function RequerimentoSemfazForm() {
  const [form, setForm] = useState<FormState>(initialState);

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
    if (!validateForm() || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: false,
      });

      const PAGE_W = 210;
      const PAGE_H = 297;

      const PAPER_X = 12;
      const PAPER_Y = 10;
      const PAPER_W = 186;
      const PAPER_H = 277;

      const CONTENT_X = 22;
      const CONTENT_W = 166;

      const HEADER_BOTTOM_Y = 34;
      const FOOTER_LINE_Y = 279;
      const FOOTER_TEXT_Y = 284;
      const BODY_START_Y = 42;
      const BODY_MAX_Y = 268;

      const COLOR_BLUE = [30, 58, 95] as const;
      const COLOR_GREEN = [112, 182, 67] as const;
      const COLOR_TEXT = [36, 52, 76] as const;
      const COLOR_MUTED = [107, 114, 128] as const;
      const COLOR_BORDER = [216, 221, 230] as const;
      const COLOR_BG = [239, 239, 239] as const;
      const BOX_HEADER_H = 7;
      const BOX_PADDING_X = 3;
      const BOX_PADDING_TOP = 4;
      const BOX_PADDING_BOTTOM = 3;
      const BOX_TEXT_LINE_H = 4.8;
      const BOX_GAP = 3;

      const BOX_INNER_X = CONTENT_X + BOX_PADDING_X;
      const BOX_INNER_W = CONTENT_W - BOX_PADDING_X * 2;

      let cursorY = BODY_START_Y;

      const safe = (value: string) => {
        const trimmed = String(value ?? "").trim();
        return trimmed ? trimmed : "-";
      };

      const splitText = (text: string, width: number) =>
        doc.splitTextToSize(text, width) as string[];

      const drawPageBase = () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, PAGE_W, PAGE_H, "F");

        doc.setTextColor(...COLOR_BLUE);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13.5);
        doc.text("PREFEITURA MUNICIPAL DE PORTO VELHO", PAGE_W / 2, 20, {
          align: "center",
        });

        doc.setFontSize(10.5);
        doc.text("SECRETARIA MUNICIPAL DE ECONOMIA", PAGE_W / 2, 25, {
          align: "center",
        });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLOR_MUTED);
        doc.text("Subsecretaria da Receita Municipal", PAGE_W / 2, 29, {
          align: "center",
        });

        doc.setDrawColor(...COLOR_GREEN);
        doc.setLineWidth(0.6);
        doc.line(
          CONTENT_X,
          HEADER_BOTTOM_Y,
          CONTENT_X + CONTENT_W,
          HEADER_BOTTOM_Y,
        );

        doc.setDrawColor(...COLOR_BORDER);
        doc.setLineWidth(0.2);
        doc.line(
          CONTENT_X,
          FOOTER_LINE_Y,
          CONTENT_X + CONTENT_W,
          FOOTER_LINE_Y,
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLOR_MUTED);
        doc.text("Anexo – Requerimento Padrão", CONTENT_X, FOOTER_TEXT_Y);
        doc.text(
          `Documento gerado eletronicamente em ${currentDate}`,
          CONTENT_X + CONTENT_W,
          FOOTER_TEXT_Y,
          { align: "right" },
        );

        doc.setTextColor(...COLOR_TEXT);
        cursorY = BODY_START_Y;
      };

      const newPage = () => {
        doc.addPage();
        drawPageBase();
      };

      const ensureSpace = (needed: number) => {
        if (cursorY + needed > BODY_MAX_Y) {
          newPage();
        }
      };

      const addMainTitle = (title: string, subtitle?: string) => {
        ensureSpace(subtitle ? 14 : 9);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...COLOR_GREEN);
        doc.text(title, PAGE_W / 2, cursorY, { align: "center" });
        cursorY += 6;

        if (subtitle) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(...COLOR_TEXT);
          doc.text(subtitle, PAGE_W / 2, cursorY, { align: "center" });
          cursorY += 6;
        }

        doc.setTextColor(...COLOR_TEXT);
      };

      const addWrappedText = (
        text: string,
        options?: {
          fontSize?: number;
          lineHeight?: number;
          align?: "left" | "center";
          spacingAfter?: number;
        },
      ) => {
        const fontSize = options?.fontSize ?? 10.5;
        const lineHeight = options?.lineHeight ?? 5;
        const align = options?.align ?? "left";
        const spacingAfter = options?.spacingAfter ?? 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(fontSize);
        doc.setTextColor(...COLOR_TEXT);

        const lines = splitText(text, align === "center" ? 120 : CONTENT_W);

        for (const line of lines) {
          ensureSpace(lineHeight);
          doc.text(line, align === "center" ? PAGE_W / 2 : CONTENT_X, cursorY, {
            align,
          });
          cursorY += lineHeight;
        }

        cursorY += spacingAfter;
      };

      const drawSectionContainer = (
        boxY: number,
        boxH: number,
        title: string,
      ) => {
        doc.setFillColor(...COLOR_BLUE);
        doc.rect(CONTENT_X, boxY, CONTENT_W, BOX_HEADER_H, "F");

        doc.setDrawColor(...COLOR_BORDER);
        doc.setLineWidth(0.35);
        doc.rect(CONTENT_X, boxY, CONTENT_W, boxH);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(title, CONTENT_X + 3, boxY + 4.7);

        doc.setTextColor(...COLOR_TEXT);
      };

      const addBoxedFieldsSection = (
        title: string,
        fields: Array<[string, string]>,
      ) => {
        const prepared = fields.map(([label, value]) =>
          splitText(`${label} ${safe(value)}`, BOX_INNER_W),
        );

        const boxH =
          BOX_HEADER_H +
          BOX_PADDING_TOP +
          BOX_PADDING_BOTTOM +
          prepared.reduce(
            (sum, lines) => sum + lines.length * BOX_TEXT_LINE_H + 1,
            0,
          );

        ensureSpace(boxH + BOX_GAP);

        const boxY = cursorY;
        drawSectionContainer(boxY, boxH, title);

        let y = boxY + BOX_HEADER_H + BOX_PADDING_TOP + 1.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLOR_TEXT);

        for (const lines of prepared) {
          for (const line of lines) {
            doc.text(line, BOX_INNER_X, y);
            y += BOX_TEXT_LINE_H;
          }
          y += 1;
        }

        cursorY = boxY + boxH + BOX_GAP;
      };

      const addBoxedBulletSection = (
        title: string,
        items: string[],
        continuationTitle?: string,
      ) => {
        const prepared = items.map((item) => splitText(item, BOX_INNER_W - 5));
        let idx = 0;
        let currentTitle = title;

        while (idx < prepared.length) {
          let remaining = BODY_MAX_Y - cursorY;
          let used = BOX_HEADER_H + BOX_PADDING_TOP + BOX_PADDING_BOTTOM;
          const pageItems: string[][] = [];

          while (idx < prepared.length) {
            const blockH = prepared[idx].length * BOX_TEXT_LINE_H + 1.2;

            if (pageItems.length === 0 && used + blockH > remaining) {
              newPage();
              remaining = BODY_MAX_Y - cursorY;
              used = BOX_HEADER_H + BOX_PADDING_TOP + BOX_PADDING_BOTTOM;
              continue;
            }

            if (pageItems.length > 0 && used + blockH > remaining) {
              break;
            }

            pageItems.push(prepared[idx]);
            used += blockH;
            idx += 1;
          }

          const boxY = cursorY;
          const boxH = used;
          drawSectionContainer(boxY, boxH, currentTitle);

          let y = boxY + BOX_HEADER_H + BOX_PADDING_TOP + 1.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(...COLOR_TEXT);

          for (const lines of pageItems) {
            if (lines.length > 0) {
              doc.text("•", BOX_INNER_X, y);
              doc.text(lines[0], BOX_INNER_X + 4, y);
              y += BOX_TEXT_LINE_H;

              for (let i = 1; i < lines.length; i += 1) {
                doc.text(lines[i], BOX_INNER_X + 4, y);
                y += BOX_TEXT_LINE_H;
              }

              y += 1.2;
            }
          }

          cursorY = boxY + boxH + BOX_GAP;
          currentTitle = continuationTitle ?? `${title} (CONTINUAÇÃO)`;
        }
      };

      const addBoxedParagraphSection = (
        title: string,
        text: string,
        continuationTitle?: string,
      ) => {
        const lines = splitText(safe(text), BOX_INNER_W);
        let start = 0;
        let currentTitle = title;

        while (start < lines.length) {
          let available = BODY_MAX_Y - cursorY;
          let maxLines = Math.floor(
            (available - BOX_HEADER_H - BOX_PADDING_TOP - BOX_PADDING_BOTTOM) /
              BOX_TEXT_LINE_H,
          );

          if (maxLines < 2) {
            newPage();
            continue;
          }

          const slice = lines.slice(start, start + maxLines);
          const boxH =
            BOX_HEADER_H +
            BOX_PADDING_TOP +
            BOX_PADDING_BOTTOM +
            slice.length * BOX_TEXT_LINE_H;

          const boxY = cursorY;
          drawSectionContainer(boxY, boxH, currentTitle);

          let y = boxY + BOX_HEADER_H + BOX_PADDING_TOP + 1.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(...COLOR_TEXT);

          for (const line of slice) {
            doc.text(line, BOX_INNER_X, y);
            y += BOX_TEXT_LINE_H;
          }

          cursorY = boxY + boxH + BOX_GAP;
          start += slice.length;
          currentTitle = continuationTitle ?? `${title} (CONTINUAÇÃO)`;

          if (start < lines.length) {
            newPage();
          }
        }
      };

      const addSignatureBlock = () => {
        const boxH = 46;

        if (cursorY + boxH + BOX_GAP > BODY_MAX_Y) {
          newPage();
        }

        const boxY = cursorY;
        drawSectionContainer(boxY, boxH, "ASSINATURA");

        let y = boxY + BOX_HEADER_H + BOX_PADDING_TOP + 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...COLOR_TEXT);

        doc.text("Nestes termos, pede deferimento.", PAGE_W / 2, y, {
          align: "center",
        });
        y += 5.5;

        doc.text(dataExtenso, PAGE_W / 2, y, {
          align: "center",
        });

        const lineY = boxY + 31;
        const lineStartX = PAGE_W / 2 - 40;
        const lineEndX = PAGE_W / 2 + 40;

        doc.setDrawColor(...COLOR_BLUE);
        doc.setLineWidth(0.3);
        doc.line(lineStartX, lineY, lineEndX, lineY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text("Sujeito passivo/Requerente", PAGE_W / 2, lineY + 6, {
          align: "center",
        });

        doc.setFont("helvetica", "normal");
        doc.text(`CPF nº ${safe(form.cpfAssinatura)}`, PAGE_W / 2, lineY + 11, {
          align: "center",
        });

        cursorY = boxY + boxH + BOX_GAP;
      };

      drawPageBase();

      addMainTitle("REQUERIMENTO PADRÃO");

      addWrappedText(
        "Ilmo. Sr. (a) Secretário (a) Municipal de Economia (SEMEC), trata-se de:",
        {
          fontSize: 10.5,
          lineHeight: 5,
          spacingAfter: 2,
        },
      );

      addBoxedFieldsSection("TIPO DE REQUERIMENTO", [
        ["Tipo de requerimento:", form.tipoRequerimento],
      ]);

      addBoxedFieldsSection("1. IDENTIFICAÇÃO DO SUJEITO PASSIVO/REQUERENTE", [
        ["Nome/Razão social:", form.nomeRazao],
        ["CPF/CNPJ:", form.cpfCnpj],
        ["Telefone/Celular:", form.telefone],
        ["E-mail:", form.email],
        ["Endereço de Correspondência:", form.logradouro],
        ["Nº:", form.numero],
        ["Bairro:", form.bairro],
        ["CEP:", form.cep],
        ["Complemento:", form.complemento],
      ]);

      addBoxedParagraphSection(
        "2. O SUJEITO PASSIVO ACIMA IDENTIFICADO VEM REQUERER:",
        form.objetoPedido,
        "2. O SUJEITO PASSIVO ACIMA IDENTIFICADO VEM REQUERER: (CONTINUAÇÃO)",
      );

      addSignatureBlock();

      const fileDate = new Date().toISOString().slice(0, 10);
      doc.save(`requerimento-semfaz-${fileDate}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Não foi possível gerar o PDF. Tente novamente.");
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
            REQUERIMENTO PADRÃO - SEMEC
          </h4>

          <p className="mb-6 text-sm leading-6 text-gray-700 md:text-base">
            Ilmo. Sr. (a) Secretário (a) Municipal de Economia (SEMEC), trata-se
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
    </>
  );
}
