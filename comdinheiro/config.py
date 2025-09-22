"""
Configuration constants and parameter templates for Comdinheiro API integration.

This module centralizes all API endpoints, parameter templates, and configuration
constants to eliminate hardcoded values scattered throughout the codebase.
"""

from typing import Dict, Any
from datetime import datetime

# Base API Configuration
BASE_URL = "https://www.comdinheiro.com.br/Clientes/API/"
BASE_REPORTS_URL = "https://www.comdinheiro.com.br/"

# API Endpoints
ENDPOINTS = {
    # Data import/export endpoints
    'export_data': 'EndPoint001.php?code=export_data',
    'import_data': 'EndPoint001.php?code=import_data',
    
    # Report endpoints
    'portfolio_report': 'RelatorioGerencialCarteiras001.php',
    'asset_allocation': 'ExtratoCarteira015.php',
    'performance_analysis': 'ExtratoCarteira022.php',
    'consolidated_position': 'PosicaoConsolidada001.php',
    'portfolio_breakdown': 'CarteiraExplodida001.php',
    'transactions': 'ComprasVendas002.php'
}

# Common parameter templates
PARAM_TEMPLATES = {
    # Basic portfolio parameters used across most endpoints
    'basic_portfolio': {
        'nome_portfolio': '{portfolio}',
        'data_ini': '{start_date}',
        'data_fim': '{end_date}',
        'format': 'JSON3'
    },
    
    # Asset allocation specific parameters
    'asset_allocation': {
        'nome_portfolio': '{portfolio}',
        'data_ini': '{start_date}',
        'data_fim': '{end_date}',
        'data_ini2': 'mes_atual',
        'layout': '1',
        'classe': 'MV(estrategia)',
        'cot_tir': 'cot',
        'benchmarks': 'CDI+IBOV',
        'data_ini_retorno': 'padrao',
        'mes': 'CDI+percent_CDI|0|V|',
        'ret': 'mes_atual+ano_atual+12m+24m+periodo',
        'liq': '0+2+6+31|corridos|ambos|0|1|pos_liq+per_pos_liq|tabela|0',
        'ord_classe': 'alfc',
        'ord_ativo': 'alfc',
        'aloc': 'pesod|b|anel|l|4|icl|0|0|2',
        'exibe_graf': '0',
        'ret2': 'ativo+saldo_bruto+percent_SB+mes_atual+03_m+06_m+12_m+24_m+ano_atual',
        'cot_tir_ativo': 'cot',
        'ret_classe': '0',
        'ret_nulos': '1',
        'ret_bench_ativo': '',
        'linha_cart': '0',
        'exibicao': 'default',
        'num_casas': '2',
        'pdf': 'V',
        'valores': '1',
        'graf_linha': '1|1||',
        'estilo_pdf': 'azul0001',
        'num_pdf': '2',
        'cota': '0'
    },
    
    # Performance analysis parameters
    'performance': {
        'nome_portfolio': '{portfolio}',
        'data_ini': '{start_date}',
        'data_fim': '{end_date}',
        'data_ini2': 'mes_atual',
        'layout': '1',
        'classe': 'TIPO',
        'cot_tir': 'tir',
        'benchmarks': 'CDI+IBOV+percent(CDI)',
        'data_ini_retorno': 'padrao',
        'mes': 'CDI+percent_CDI|0|V|',
        'ret': 'mes_atual+ano_atual+12m+24m+periodo+03m',
        'liq': '0+2+6+31|corridos|ambos|0|1|pos_liq+per_pos_liq|tabela|0',
        'ord_classe': 'alfc',
        'ord_ativo': 'alfc',
        'aloc': 'pesod|b|anel|l|4|icl|0|0|2',
        'exibe_graf': '0',
        'ret2': 'ativo+saldo_bruto+percent_SB+mes_atual+03_m+06_m+12_m+24_m+ano_atual',
        'cot_tir_ativo': 'cot',
        'ret_classe': '0',
        'ret_nulos': '1',
        'ret_bench_ativo': '',
        'linha_cart': '0',
        'exibicao': 'default',
        'num_casas': '2',
        'pdf': 'V',
        'valores': '1',
        'graf_linha': '1|1||',
        'estilo_pdf': 'azul0001',
        'num_pdf': '2',
        'cota': '0'
    },
    
    # Portfolio balance parameters
    'portfolio_balance': {
        'data_analise': '{end_date}',
        'data_ini': '',
        'nome_portfolio': '{portfolio}',
        'variaveis': 'nome_portfolio+saldo_bruto',
        'filtro': 'all',
        'ativo': '',
        'filtro_IF': 'todos',
        'relat_alias': '',
        'layout': '0',
        'layoutB': '0',
        'num_casas': '',
        'enviar_email': '0',
        'portfolio_editavel': '',
        'filtro_id': ''
    },
    
    # Detailed report parameters
    'detailed_report': {
        'data_analise': '{end_date}',
        'data_ini': '{end_date}',
        'nome_portfolio': '{portfolio}',
        'variaveis': 'instituicao_financeira+ativo+desc+quant+saldo_bruto+data_aplicacao+pu_aplic+pu',
        'filtro': 'all',
        'ativo': '',
        'filtro_IF': 'todos',
        'relat_alias': '',
        'layout': '0',
        'layoutB': '0',
        'num_casas': '',
        'enviar_email': '0',
        'portfolio_editavel': '',
        'filtro_id': ''
    },
    
    # Consolidated report parameters  
    'consolidated_report': {
        'data_analise': '{end_date}',
        'data_ini': '{end_date}',
        'nome_portfolio': '{portfolio}',
        'variaveis': 'instituicao_financeira+ativo+desc+quant+saldo_bruto+tipo_ativo+saldo_liquido',
        'filtro': 'all',
        'ativo': '',
        'filtro_IF': 'todos',
        'relat_alias': '',
        'layout': '0',
        'layoutB': '0',
        'num_casas': '',
        'enviar_email': '0',
        'portfolio_editavel': '',
        'filtro_id': ''
    },
    
    # Transaction listing parameters
    'transactions': {
        'nome_portfolio': '{portfolio}',
        'id': '0',
        'operacao': 'listar',
        'portfolio_editavel': '',
        'data_operacao_ini': '',
        'data_operacao_fim': '',
        'data_liquidacao_ini': '',
        'data_liquidacao_fim': '',
        'data_cadastro_ini': '{start_date}',
        'data_cadastro_fim': '{end_date}',
        'filtro_CV': '{operation}',
        'filtro_tipo_ativo': 'todos',
        'filtro_ativos': '',
        'filtro_tabelas': 'todos',
        'filtro_IF': '{bank}',
        'exporta_classificacao': '0',
        'export_nome_classificacao': '',
        'filtro_id': ''
    },
    
    # Portfolio breakdown (old consolidated view)
    'portfolio_breakdown': {
        'nome_portfolio': '{portfolio}',
        'data_fim': '{end_date}',
        'classe': 'IF',
        'cart_explodida': '',
        'agrupar': '1',
        'exibicao': 'default',
        'ord_ativo': 'alfc',
        'ord_classe': 'alfc',
        'num_casas': '2',
        'estilo_pdf': 'azul0001',
        'num_pdf': '2',
        'pdf': 'H',
        'data_ini': 'mes_atual',
        'ret2': 'cor+ativo+sbr+percent_sbr'
    }
}

# View type mappings to simplify endpoint selection
VIEW_TYPE_MAPPING = {
    'consolidado(antigo)': ('portfolio_breakdown', 'portfolio_breakdown'),
    'consolidado': ('portfolio_report', 'consolidated_report'),
    'relatorio': ('portfolio_report', 'detailed_report'),
    'relatorio2': ('portfolio_report', 'consolidated_report'),
    'movimentacoes': ('transactions', 'transactions'),
    'analise': ('performance_analysis', 'performance'),
    'asset_allocation': ('asset_allocation', 'asset_allocation'),
    'saldo': ('portfolio_report', 'portfolio_balance')
}

# Date format constants
DATE_FORMAT_INPUT = '%Y-%m-%d'
DATE_FORMAT_API = '%d%m%Y'

# Default values
DEFAULT_VIEW_TYPE = 'consolidado'
DEFAULT_OPERATION = 'todos'
DEFAULT_BANK = 'todos'

# Error messages
ERROR_MESSAGES = {
    'invalid_credentials': 'Credenciais inválidas ou não encontradas',
    'invalid_date': 'Formato de data inválido. Use YYYY-MM-DD',
    'api_error': 'Não foi possível obter os dados da API do ComDinheiro',
    'no_data': 'Nenhum dado encontrado para os parâmetros fornecidos',
    'session_expired': 'Sessão expirada. Faça login novamente',
    'portfolio_not_found': 'Carteira não encontrada',
    'invalid_view_type': 'Tipo de visualização não suportado'
}

# Data processing constants
ASSET_CATEGORIES = {
    'renda_variavel': ['renda variável', 'renda variavel'],
    'multimercado': ['multimercado'],
    'renda_fixa': ['renda fixa'],
    'fundos': ['fundos'],
    'exterior': ['exterior']
}

# Currency formatting
CURRENCY_FORMAT = {
    'thousands_separator': '.',
    'decimal_separator': ',',
    'currency_symbol': 'R$'
}


def format_date_for_api(date_str: str) -> str:
    """Convert date from YYYY-MM-DD to DDMMYYYY format for API."""
    if not date_str or date_str == 'None':
        return ''
    
    try:
        date_obj = datetime.strptime(date_str, DATE_FORMAT_INPUT)
        return date_obj.strftime(DATE_FORMAT_API)
    except ValueError:
        return ''


def get_endpoint_config(view_type: str) -> tuple:
    """Get endpoint and parameter template for a given view type."""
    return VIEW_TYPE_MAPPING.get(view_type, ('portfolio_report', 'consolidated_report'))


def build_parameters(template_name: str, **kwargs) -> Dict[str, Any]:
    """Build parameters from template with variable substitution."""
    template = PARAM_TEMPLATES.get(template_name, {})
    
    # Create a copy of the template
    params = template.copy()
    
    # Substitute variables in template
    for key, value in params.items():
        if isinstance(value, str) and '{' in value:
            try:
                params[key] = value.format(**kwargs)
            except KeyError:
                # If substitution fails, keep original value
                pass
    
    # Add any additional parameters not in template
    for key, value in kwargs.items():
        template_key = f'{{{key}}}'
        if template_key not in str(template.values()):
            params[key] = value
    
    return params