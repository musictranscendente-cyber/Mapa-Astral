import type { ReactNode } from 'react'
import type { Route } from '../App'

/** E-mail shown in the legal pages for privacy requests. Fill in before publishing in the stores. */
const CONTACT_EMAIL = ''

const UPDATED = '24 de outubro de 2026'

const contact = CONTACT_EMAIL
  ? <>pelo e-mail <b>{CONTACT_EMAIL}</b></>
  : <>pelos canais de contato informados no app</>

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function LegalPage({ doc, go }: { doc: 'termos' | 'privacidade'; go: (r: Route) => void }) {
  return (
    <div className="legal">
      <header className="page-head">
        <p className="eyebrow">Cosmic Sky</p>
        <h1 className="title-glow">{doc === 'termos' ? 'Termos de Uso' : 'Política de Privacidade'}</h1>
        <p className="muted">Última atualização: {UPDATED}</p>
        <div className="segmented">
          <button className={doc === 'termos' ? 'active' : ''} onClick={() => go('termos')}>Termos de Uso</button>
          <button className={doc === 'privacidade' ? 'active' : ''} onClick={() => go('privacidade')}>Privacidade</button>
        </div>
      </header>
      <article className="glass pad legal-body">{doc === 'termos' ? <Terms /> : <Privacy />}</article>
    </div>
  )
}

function Terms() {
  return (
    <>
      <p>
        Bem-vindo ao <b>Cosmic Sky</b>. Ao usar o app, você concorda com estes Termos. Se não concordar, não utilize o serviço.
      </p>
      <Section title="1. O que é o Cosmic Sky">
        <p>
          O Cosmic Sky calcula mapas astrais, o céu do dia, previsões, sinastrias e revoluções solares a partir de efemérides
          astronômicas, e apresenta interpretações astrológicas para autoconhecimento e entretenimento.
        </p>
        <p>
          <b>A astrologia não é ciência exata.</b> As interpretações têm caráter simbólico e reflexivo e <b>não substituem</b> orientação
          médica, psicológica, jurídica, financeira ou de qualquer outro profissional. Decisões tomadas com base no app são de sua
          exclusiva responsabilidade.
        </p>
      </Section>
      <Section title="2. Análises completas">
        <p>
          As análises completas são textos personalizados gerados automaticamente por sistema de redação de terceiros, a partir das
          posições calculadas do seu mapa. Podem conter imprecisões e devem ser lidas como reflexão, não como verdade absoluta.
        </p>
      </Section>
      <Section title="3. Conta">
        <ul>
          <li>Você pode usar parte do app sem conta. Para salvar mapas na nuvem e comprar serviços, é preciso entrar com Google ou e-mail.</li>
          <li>Você é responsável pelos dados de nascimento que informa e por ter autorização para cadastrar dados de outras pessoas.</li>
          <li>O app é destinado a maiores de 18 anos, ou a menores com autorização dos responsáveis.</li>
          <li>Você pode excluir sua conta a qualquer momento em <b>Minha conta → Excluir conta</b>.</li>
        </ul>
      </Section>
      <Section title="4. Planos e compras avulsas">
        <ul>
          <li>Os pagamentos são processados pelo <b>Mercado Pago</b> (Pix ou cartão). O Cosmic Sky não recebe nem armazena dados de cartão.</li>
          <li>Os planos <b>não renovam automaticamente</b>: valem pelo período comprado (1 mês ou 1 ano). Comprar de novo soma o tempo restante do mesmo plano; trocar de plano inicia um novo período.</li>
          <li>Os serviços avulsos ficam liberados para o mapa escolhido; a Previsão de 12 meses, o Pacote Aniversário e o Retorno Lunar valem por 1 ano. Cada compra avulsa inclui uma geração da análise completa daquele serviço; novas versões exigem nova compra ou um plano.</li>
          <li>As análises completas dos planos formam uma cota mensal única, válida para todos os serviços, que se renova no dia 1º de cada mês e não acumula.</li>
          <li>As análises incluídas em planos e compras têm os limites descritos na página Planos.</li>
          <li>
            <b>Direito de arrependimento:</b> você pode pedir o reembolso em até 7 dias após a compra (art. 49 do Código de Defesa do
            Consumidor), {contact}. Planos e compras já utilizados (análises geradas) podem ter o reembolso proporcional.
          </li>
          <li>Preços e condições podem mudar; compras já feitas mantêm as condições da data da compra.</li>
        </ul>
      </Section>
      <Section title="5. Uso adequado">
        <p>
          Não é permitido usar o app para fins ilícitos, tentar burlar limites de acesso ou pagamentos, copiar o conteúdo em larga
          escala ou prejudicar o funcionamento do serviço. Contas que violarem estes Termos podem ser suspensas.
        </p>
      </Section>
      <Section title="6. Propriedade intelectual">
        <p>
          Textos, interpretações, design, marca e código do Cosmic Sky pertencem aos seus titulares. Você pode compartilhar as
          imagens e textos do seu próprio mapa para uso pessoal.
        </p>
      </Section>
      <Section title="7. Disponibilidade e responsabilidade">
        <p>
          Trabalhamos para manter o app disponível e preciso, mas ele é oferecido "no estado em que se encontra", podendo haver
          interrupções, mudanças ou erros. Na extensão permitida pela lei, não nos responsabilizamos por danos indiretos decorrentes
          do uso das interpretações.
        </p>
      </Section>
      <Section title="8. Alterações e lei aplicável">
        <p>
          Estes Termos podem ser atualizados; a data acima indica a versão vigente. Aplica-se a legislação brasileira, incluindo o
          Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados (LGPD).
        </p>
      </Section>
    </>
  )
}

function Privacy() {
  return (
    <>
      <p>
        Esta Política explica quais dados o <b>Cosmic Sky</b> usa, por quê e quais são os seus direitos, conforme a Lei Geral de
        Proteção de Dados (Lei 13.709/2018 — LGPD).
      </p>
      <Section title="1. Dados que usamos">
        <ul>
          <li><b>Dados de nascimento</b> (nome, data, hora e local) que você informa para calcular os mapas — seus e de outras pessoas que você cadastrar.</li>
          <li><b>Dados da conta</b>: e-mail e, se entrar com Google, nome e foto do perfil.</li>
          <li><b>Compras</b>: produto, valor, data e situação do pagamento. Os dados de pagamento ficam com o Mercado Pago.</li>
          <li><b>Uso das análises</b>: quantas análises completas foram geradas, para controlar o saldo.</li>
          <li><b>Contagem de acessos anônima</b>: um código aleatório do aparelho, sem nome, e-mail ou endereço IP, para saber quantas pessoas usam o app e de onde vêm (ex.: link compartilhado).</li>
          <li><b>Localização</b>: só quando você toca em "Onde estou", para calcular a revolução solar. Não guardamos seu histórico de localização.</li>
        </ul>
      </Section>
      <Section title="2. Para que usamos">
        <ul>
          <li>Calcular e mostrar seus mapas, previsões e relatórios (execução do serviço).</li>
          <li>Sincronizar seus mapas entre aparelhos quando você entra na conta (execução do serviço).</li>
          <li>Processar compras e liberar o acesso pago (execução de contrato).</li>
          <li>Gerar as análises completas, enviando somente as posições calculadas do mapa e o nome informado (execução do serviço).</li>
          <li>Melhorar o app com estatísticas anônimas de uso (legítimo interesse).</li>
        </ul>
        <p>Não vendemos seus dados e não os usamos para publicidade.</p>
      </Section>
      <Section title="3. Onde ficam e com quem compartilhamos">
        <ul>
          <li><b>No seu aparelho</b>: mapas, preferências e análises já geradas ficam salvos no navegador.</li>
          <li><b>Supabase</b>: hospedagem do login, dos mapas sincronizados, das compras e das estatísticas.</li>
          <li><b>Mercado Pago</b>: processamento dos pagamentos.</li>
          <li><b>Anthropic</b>: serviço de redação automatizada que gera o texto das análises completas.</li>
          <li><b>Google</b>: login com conta Google, se você escolher essa opção.</li>
        </ul>
        <p>
          Alguns desses fornecedores podem tratar dados fora do Brasil, com as salvaguardas previstas na LGPD.
        </p>
      </Section>
      <Section title="4. Por quanto tempo">
        <p>
          Mantemos seus dados enquanto sua conta existir. Ao excluir a conta, os mapas da nuvem e o login são apagados; registros de
          compras podem ser guardados pelo prazo exigido pela legislação fiscal. Os dados salvos no aparelho podem ser apagados por
          você em <b>Minha conta → Sair e apagar mapas deste aparelho</b>.
        </p>
      </Section>
      <Section title="5. Seus direitos">
        <p>Você pode, a qualquer momento:</p>
        <ul>
          <li>confirmar e acessar seus dados, e corrigir dados incompletos ou desatualizados (editando seus perfis);</li>
          <li>pedir a exclusão — diretamente em <b>Minha conta → Excluir conta</b>;</li>
          <li>pedir a portabilidade, informações sobre compartilhamento e revogar consentimentos;</li>
          <li>reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
        <p>Para exercer qualquer direito, fale conosco {contact}.</p>
      </Section>
      <Section title="6. Segurança">
        <p>
          Usamos conexões criptografadas, controle de acesso por conta (cada pessoa só lê os próprios dados) e não guardamos senhas —
          o acesso é por Google ou código enviado ao e-mail.
        </p>
      </Section>
      <Section title="7. Alterações">
        <p>Esta Política pode ser atualizada; a data no topo indica a versão vigente.</p>
      </Section>
    </>
  )
}
