"""
Simplified main interface for Comdinheiro integration.

This module provides clean, simple functions that replace the complex
legacy implementation while maintaining backward compatibility.
"""

import warnings
from typing import Dict, Any, Optional, Tuple, List
from datetime import datetime

from .api_client import ComdinheiroAPI
from .auth_manager import AuthManager
from .data_processor import DataProcessor
from .config import ERROR_MESSAGES, DEFAULT_VIEW_TYPE


# ==========================================
# NEW SIMPLIFIED INTERFACE
# ==========================================

def get_portfolio_list(username: str = None, password: str = None) -> List[Dict]:
    """
    Get list of available portfolios with their balances and institutions.
    
    Args:
        username (str, optional): Comdinheiro username. If None, uses session credentials.
        password (str, optional): Comdinheiro password. If None, uses session credentials.
        
    Returns:
        list: List of portfolio dictionaries
        
    Example:
        portfolios = get_portfolio_list()
        for portfolio in portfolios:
            print(f"{portfolio['nome_portfolio']}: {portfolio['saldo_bruto']}")
    """
    if username and password:
        api = ComdinheiroAPI(username, password)
    else:
        api = AuthManager.create_authenticated_api_client()
        if not api:
            return []
    
    result = api.get_portfolio_list()
    return result if result else []


def get_portfolio_data(portfolio: str, start_date: str = None, end_date: str = None,
                      view_type: str = DEFAULT_VIEW_TYPE, bank: str = 'todos', 
                      operation: str = 'todos', username: str = None, 
                      password: str = None) -> Tuple[Optional[Dict], Optional[str]]:
    """
    Get comprehensive portfolio data based on view type.
    
    This is the main function that replaces get_comdinheiro_data().
    
    Args:
        portfolio (str): Portfolio name
        start_date (str, optional): Start date in YYYY-MM-DD format
        end_date (str, optional): End date in YYYY-MM-DD format
        view_type (str): View type ('consolidado', 'relatorio', 'movimentacoes', etc.)
        bank (str): Bank filter for transactions
        operation (str): Operation filter for transactions
        username (str, optional): Comdinheiro username
        password (str, optional): Comdinheiro password
        
    Returns:
        tuple: (data_dict, error_message) - data_dict is None if error occurred
        
    Example:
        data, error = get_portfolio_data("Carteira_Principal", view_type="consolidado")
        if data:
            print(f"Total: {data.get('total_geral', '0,00')}")
        else:
            print(f"Error: {error}")
    """
    if username and password:
        api = ComdinheiroAPI(username, password)
    else:
        api = AuthManager.create_authenticated_api_client()
        if not api:
            return None, ERROR_MESSAGES['invalid_credentials']
    
    return api.get_portfolio_data(portfolio, start_date, end_date, view_type, bank, operation)


def get_asset_allocation(portfolio: str, end_date: str = None, 
                        username: str = None, password: str = None) -> Optional[Dict]:
    """
    Get asset allocation data for a portfolio.
    
    Args:
        portfolio (str): Portfolio name
        end_date (str, optional): End date in YYYY-MM-DD format
        username (str, optional): Comdinheiro username
        password (str, optional): Comdinheiro password
        
    Returns:
        dict: Asset allocation data with chart, balance, and performance
        
    Example:
        allocation = get_asset_allocation("Carteira_Principal")
        if allocation:
            print(f"Balance: {allocation['saldo_bruto']}")
            print(f"Allocations: {allocation['grafico1']}")
    """
    if username and password:
        api = ComdinheiroAPI(username, password)
    else:
        api = AuthManager.create_authenticated_api_client()
        if not api:
            return None
    
    return api.get_asset_allocation(portfolio, end_date)


def get_portfolio_balance(portfolio: str, date: str = None,
                         username: str = None, password: str = None) -> Optional[float]:
    """
    Get current balance for a specific portfolio.
    
    Args:
        portfolio (str): Portfolio name
        date (str, optional): Date in YYYY-MM-DD format
        username (str, optional): Comdinheiro username
        password (str, optional): Comdinheiro password
        
    Returns:
        float: Portfolio balance or None if error
        
    Example:
        balance = get_portfolio_balance("Carteira_Principal")
        print(f"Current balance: R$ {balance:,.2f}")
    """
    if username and password:
        api = ComdinheiroAPI(username, password)
    else:
        api = AuthManager.create_authenticated_api_client()
        if not api:
            return None
    
    return api.get_portfolio_balance(portfolio, date)


def export_portfolio_data(content_data, on_error: int = 0,
                         username: str = None, password: str = None) -> Optional[str]:
    """
    Export data to Comdinheiro API.
    
    Args:
        content_data: DataFrame or data to export
        on_error (int): Error handling mode
        username (str, optional): Comdinheiro username
        password (str, optional): Comdinheiro password
        
    Returns:
        str: Response message or None if error
        
    Example:
        result = export_portfolio_data(df_transactions)
        if result:
            print(f"Export result: {result}")
    """
    if username and password:
        api = ComdinheiroAPI(username, password)
    else:
        api = AuthManager.create_authenticated_api_client()
        if not api:
            return None
    
    return api.export_data(content_data, on_error)


# ==========================================
# BACKWARD COMPATIBILITY FUNCTIONS
# ==========================================

def carteiras_comdinheiro(username: str, password: str) -> list:
    """
    Legacy function: Get list of portfolios and their information.
    
    DEPRECATED: Use get_portfolio_list() instead.
    
    Args:
        username (str): Comdinheiro username
        password (str): Comdinheiro password
        
    Returns:
        list: List of portfolio dictionaries
    """
    warnings.warn(
        "carteiras_comdinheiro() is deprecated. Use get_portfolio_list() instead.",
        DeprecationWarning,
        stacklevel=2
    )
    
    return get_portfolio_list(username, password)


def carteiras_patrimonio(username: str, password: str) -> dict:
    """
    Legacy function: Get portfolio balances as a dictionary.
    
    DEPRECATED: Use get_portfolio_list() and extract balances.
    
    Args:
        username (str): Comdinheiro username
        password (str): Comdinheiro password
        
    Returns:
        dict: Dictionary with portfolio names as keys and balances as values
    """
    warnings.warn(
        "carteiras_patrimonio() is deprecated. Use get_portfolio_list() instead.",
        DeprecationWarning,
        stacklevel=2
    )
    
    portfolios = get_portfolio_list(username, password)
    if not portfolios:
        return {}
    
    patrimonio = {}
    for portfolio in portfolios:
        name = portfolio.get('nome_portfolio', '')
        balance_str = portfolio.get('saldo_bruto', '0')
        
        if name:
            try:
                # Convert Brazilian currency format to float
                balance = DataProcessor.parse_brazilian_currency(balance_str)
                patrimonio[name] = balance
            except (ValueError, TypeError):
                patrimonio[name] = 0.0
                
    return patrimonio


def asset_allocation_comdinheiro(username: str, password: str, carteira: str,
                               data_final: str = None) -> Optional[Dict]:
    """
    Legacy function: Get asset allocation data.
    
    DEPRECATED: Use get_asset_allocation() instead.
    
    Args:
        username (str): Comdinheiro username
        password (str): Comdinheiro password
        carteira (str): Portfolio name
        data_final (str, optional): End date in YYYY-MM-DD format
        
    Returns:
        dict: Asset allocation data
    """
    warnings.warn(
        "asset_allocation_comdinheiro() is deprecated. Use get_asset_allocation() instead.",
        DeprecationWarning,
        stacklevel=2
    )
    
    return get_asset_allocation(carteira, data_final, username, password)


def get_comdinheiro_data(username, password, data_inicial, data_final,
                        carteira, banco, operacao, view_type):
    """
    Legacy function: Get comprehensive portfolio data.
    
    DEPRECATED: Use get_portfolio_data() instead.
    
    Args:
        username (str): Comdinheiro username
        password (str): Comdinheiro password
        data_inicial (str): Start date
        data_final (str): End date
        carteira (str): Portfolio name
        banco (str): Bank filter
        operacao (str): Operation filter
        view_type (str): View type
        
    Returns:
        tuple: (data, error_message)
    """
    warnings.warn(
        "get_comdinheiro_data() is deprecated. Use get_portfolio_data() instead.",
        DeprecationWarning,
        stacklevel=2
    )
    
    # Convert date format if needed
    start_date = str(data_inicial) if data_inicial else None
    end_date = str(data_final) if data_final else None
    
    return get_portfolio_data(carteira, start_date, end_date, view_type, 
                            banco, operacao, username, password)


def envia_comdinheiro(content_data, on_error: int = 0, 
                     username: str = None, password: str = None) -> Optional[str]:
    """
    Legacy function: Export data to Comdinheiro.
    
    DEPRECATED: Use export_portfolio_data() instead.
    
    Args:
        content_data: Data to export
        on_error (int): Error handling mode
        username (str, optional): Comdinheiro username
        password (str, optional): Comdinheiro password
        
    Returns:
        str: Response message
    """
    warnings.warn(
        "envia_comdinheiro() is deprecated. Use export_portfolio_data() instead.",
        DeprecationWarning,
        stacklevel=2
    )
    
    return export_portfolio_data(content_data, on_error, username, password)


# ==========================================
# UTILITY FUNCTIONS
# ==========================================

def test_api_connection(username: str = None, password: str = None) -> bool:
    """
    Test connection to Comdinheiro API.
    
    Args:
        username (str, optional): Comdinheiro username
        password (str, optional): Comdinheiro password
        
    Returns:
        bool: True if connection successful
        
    Example:
        if test_api_connection():
            print("API connection successful")
        else:
            print("API connection failed")
    """
    if username and password:
        api = ComdinheiroAPI(username, password)
    else:
        api = AuthManager.create_authenticated_api_client()
        if not api:
            return False
    
    return api.test_connection()


def get_user_portfolios() -> List[str]:
    """
    Get list of portfolio names for the authenticated user.
    
    Returns:
        list: List of portfolio names
        
    Example:
        portfolios = get_user_portfolios()
        for portfolio in portfolios:
            print(f"Available portfolio: {portfolio}")
    """
    portfolios = get_portfolio_list()
    return [p.get('nome_portfolio', '') for p in portfolios if p.get('nome_portfolio')]


def get_available_view_types() -> List[str]:
    """
    Get list of available view types.
    
    Returns:
        list: List of available view types
    """
    from .config import VIEW_TYPE_MAPPING
    return list(VIEW_TYPE_MAPPING.keys())


def format_currency(value: float) -> str:
    """
    Format numeric value as Brazilian currency.
    
    Args:
        value (float): Numeric value
        
    Returns:
        str: Formatted currency string
        
    Example:
        formatted = format_currency(1234567.89)
        print(formatted)  # "1.234.567,89"
    """
    return DataProcessor.format_brazilian_currency(value)


def parse_currency(value: str) -> float:
    """
    Parse Brazilian currency string to float.
    
    Args:
        value (str): Currency string
        
    Returns:
        float: Numeric value
        
    Example:
        numeric = parse_currency("1.234.567,89")
        print(numeric)  # 1234567.89
    """
    return DataProcessor.parse_brazilian_currency(value)