/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AReceber from './pages/AReceber';
import Agenda from './pages/Agenda';
import CadastroPermuta from './pages/CadastroPermuta';
import CafesPublico from './pages/CafesPublico';
import CalculadoraAgridrones from './pages/CalculadoraAgridrones';
import CalculadoraEventos from './pages/CalculadoraEventos';
import CalculadoraFornecedores from './pages/CalculadoraFornecedores';
import ClubeAssinatura from './pages/ClubeAssinatura';
import Configuracoes from './pages/Configuracoes';
import ContratosRPA from './pages/ContratosRPA';
import CotacaoFrete from './pages/CotacaoFrete';
import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import ExportarDados from './pages/ExportarDados';
import FormularioProdutor from './pages/FormularioProdutor';
import GerenciarInfosCafe from './pages/GerenciarInfosCafe';
import GerenciarSubmissoes from './pages/GerenciarSubmissoes';
import Home from './pages/Home';
import InfoCafePublico from './pages/InfoCafePublico';
import IntegracaoYampi from './pages/IntegracaoYampi';
import LinksClientes from './pages/LinksClientes';
import Logistica from './pages/Logistica';
import MinhaAssinatura from './pages/MinhaAssinatura';
import PortalCliente from './pages/PortalCliente';
import Privacy from './pages/Privacy';
import Problemas from './pages/Problemas';
import Relatorios from './pages/Relatorios';
import ReservaPublica from './pages/ReservaPublica';
import SolicitacoesCafe from './pages/SolicitacoesCafe';
import SolicitarPatrocinio from './pages/SolicitarPatrocinio';
import Support from './pages/Support';
import TabelaPrivateLabel from './pages/TabelaPrivateLabel';
import Tarefas from './pages/Tarefas';
import Usuarios from './pages/Usuarios';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AReceber": AReceber,
    "Agenda": Agenda,
    "CadastroPermuta": CadastroPermuta,
    "CafesPublico": CafesPublico,
    "CalculadoraAgridrones": CalculadoraAgridrones,
    "CalculadoraEventos": CalculadoraEventos,
    "CalculadoraFornecedores": CalculadoraFornecedores,
    "ClubeAssinatura": ClubeAssinatura,
    "Configuracoes": Configuracoes,
    "ContratosRPA": ContratosRPA,
    "CotacaoFrete": CotacaoFrete,
    "Dashboard": Dashboard,
    "Estoque": Estoque,
    "ExportarDados": ExportarDados,
    "FormularioProdutor": FormularioProdutor,
    "GerenciarInfosCafe": GerenciarInfosCafe,
    "GerenciarSubmissoes": GerenciarSubmissoes,
    "Home": Home,
    "InfoCafePublico": InfoCafePublico,
    "IntegracaoYampi": IntegracaoYampi,
    "LinksClientes": LinksClientes,
    "Logistica": Logistica,
    "MinhaAssinatura": MinhaAssinatura,
    "PortalCliente": PortalCliente,
    "Privacy": Privacy,
    "Problemas": Problemas,
    "Relatorios": Relatorios,
    "ReservaPublica": ReservaPublica,
    "SolicitacoesCafe": SolicitacoesCafe,
    "SolicitarPatrocinio": SolicitarPatrocinio,
    "Support": Support,
    "TabelaPrivateLabel": TabelaPrivateLabel,
    "Tarefas": Tarefas,
    "Usuarios": Usuarios,
}

export const pagesConfig = {
    mainPage: "PortalCliente",
    Pages: PAGES,
    Layout: __Layout,
};