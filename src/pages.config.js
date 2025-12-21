import Dashboard from './pages/Dashboard';
import Logistica from './pages/Logistica';
import Estoque from './pages/Estoque';
import Problemas from './pages/Problemas';
import Agenda from './pages/Agenda';
import Usuarios from './pages/Usuarios';
import Configuracoes from './pages/Configuracoes';
import PortalCliente from './pages/PortalCliente';
import Tarefas from './pages/Tarefas';
import ReservaPublica from './pages/ReservaPublica';
import LinksClientes from './pages/LinksClientes';
import CalculadoraEventos from './pages/CalculadoraEventos';
import SolicitacoesCafe from './pages/SolicitacoesCafe';
import SolicitarPatrocinio from './pages/SolicitarPatrocinio';
import CalculadoraFornecedores from './pages/CalculadoraFornecedores';
import TabelaPrivateLabel from './pages/TabelaPrivateLabel';
import Relatorios from './pages/Relatorios';
import AReceber from './pages/AReceber';
import CalculadoraAgridrones from './pages/CalculadoraAgridrones';
import Privacy from './pages/Privacy';
import Support from './pages/Support';
import InfoCafePublico from './pages/InfoCafePublico';
import GerenciarInfosCafe from './pages/GerenciarInfosCafe';
import FormularioProdutor from './pages/FormularioProdutor';
import GerenciarSubmissoes from './pages/GerenciarSubmissoes';
import ClubeAssinatura from './pages/ClubeAssinatura';
import MinhaAssinatura from './pages/MinhaAssinatura';
import CotacaoFrete from './pages/CotacaoFrete';
import IntegracaoYampi from './pages/IntegracaoYampi';
import ContratosRPA from './pages/ContratosRPA';
import CafesPublico from './pages/CafesPublico';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Logistica": Logistica,
    "Estoque": Estoque,
    "Problemas": Problemas,
    "Agenda": Agenda,
    "Usuarios": Usuarios,
    "Configuracoes": Configuracoes,
    "PortalCliente": PortalCliente,
    "Tarefas": Tarefas,
    "ReservaPublica": ReservaPublica,
    "LinksClientes": LinksClientes,
    "CalculadoraEventos": CalculadoraEventos,
    "SolicitacoesCafe": SolicitacoesCafe,
    "SolicitarPatrocinio": SolicitarPatrocinio,
    "CalculadoraFornecedores": CalculadoraFornecedores,
    "TabelaPrivateLabel": TabelaPrivateLabel,
    "Relatorios": Relatorios,
    "AReceber": AReceber,
    "CalculadoraAgridrones": CalculadoraAgridrones,
    "Privacy": Privacy,
    "Support": Support,
    "InfoCafePublico": InfoCafePublico,
    "GerenciarInfosCafe": GerenciarInfosCafe,
    "FormularioProdutor": FormularioProdutor,
    "GerenciarSubmissoes": GerenciarSubmissoes,
    "ClubeAssinatura": ClubeAssinatura,
    "MinhaAssinatura": MinhaAssinatura,
    "CotacaoFrete": CotacaoFrete,
    "IntegracaoYampi": IntegracaoYampi,
    "ContratosRPA": ContratosRPA,
    "CafesPublico": CafesPublico,
}

export const pagesConfig = {
    mainPage: "PortalCliente",
    Pages: PAGES,
    Layout: __Layout,
};