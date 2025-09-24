"""
Simplified Comdinheiro Integration Module

This module provides a clean, maintainable interface for interacting with 
the Comdinheiro API, replacing the complex URL construction and data processing
patterns with a standardized, object-oriented approach.

Key components:
- ComdinheiroAPI: Core API client with standardized endpoints
- AuthManager: Unified authentication handling
- DataProcessor: Standardized response processing
- Configuration: Centralized constants and templates

Usage Examples:

# Simple usage with session authentication:
    from comdinheiro import get_portfolio_data, get_asset_allocation
    
    data, error = get_portfolio_data("Carteira_Principal", view_type="consolidado")
    allocation = get_asset_allocation("Carteira_Principal")

# Direct API usage:
    from comdinheiro import ComdinheiroAPI, AuthManager
    
    api = AuthManager.create_authenticated_api_client()
    portfolio_data = api.get_portfolio_data("Carteira_Principal")

# Legacy compatibility:
    from comdinheiro import carteiras_comdinheiro  # Deprecated but available
"""

# Core classes
from .api_client import ComdinheiroAPI
from .auth_manager import AuthManager
from .data_processor import DataProcessor
from .config import ENDPOINTS, PARAM_TEMPLATES

# Simplified interface functions
from .main_interface import (
    # New simplified functions
    get_portfolio_list,
    get_portfolio_data,
    get_asset_allocation,
    get_portfolio_balance,
    export_portfolio_data,
    test_api_connection,
    get_user_portfolios,
    get_available_view_types,
    format_currency,
    parse_currency,
    
    # Legacy compatibility functions (deprecated)
    carteiras_comdinheiro,
    carteiras_patrimonio,
    asset_allocation_comdinheiro,
    get_comdinheiro_data,
    envia_comdinheiro
)

__version__ = "1.0.0"
__all__ = [
    # Core classes
    "ComdinheiroAPI", 
    "AuthManager", 
    "DataProcessor", 
    "ENDPOINTS", 
    "PARAM_TEMPLATES",
    
    # New simplified interface
    "get_portfolio_list",
    "get_portfolio_data", 
    "get_asset_allocation",
    "get_portfolio_balance",
    "export_portfolio_data",
    "test_api_connection",
    "get_user_portfolios",
    "get_available_view_types",
    "format_currency",
    "parse_currency",
    
    # Legacy compatibility (deprecated)
    "carteiras_comdinheiro",
    "carteiras_patrimonio", 
    "asset_allocation_comdinheiro",
    "get_comdinheiro_data",
    "envia_comdinheiro"
]