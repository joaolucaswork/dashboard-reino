"""
Core API client for Comdinheiro integration.

This module provides a clean, standardized interface for all Comdinheiro API
interactions, replacing the complex URL construction patterns with a 
maintainable object-oriented approach.
"""

import requests
import pandas as pd
from typing import Dict, Any, Optional, Tuple
from urllib.parse import urlencode
from datetime import datetime

from .config import (
    BASE_URL, BASE_REPORTS_URL, ENDPOINTS, PARAM_TEMPLATES, 
    VIEW_TYPE_MAPPING, format_date_for_api, build_parameters,
    ERROR_MESSAGES, DEFAULT_VIEW_TYPE
)


class ComdinheiroAPI:
    """
    Simplified Comdinheiro API client with standardized endpoints and methods.
    
    This class replaces the complex URL construction and data fetching patterns
    with clean, maintainable methods for all Comdinheiro operations.
    """
    
    def __init__(self, username: str, password: str):
        """
        Initialize the API client with credentials.
        
        Args:
            username (str): Comdinheiro username
            password (str): Comdinheiro password
        """
        self.credentials = {
            'username': username,
            'password': password
        }
        self.session = requests.Session()
        
    def _build_url(self, endpoint_key: str, params: Dict[str, Any] = None) -> str:
        """
        Build complete URL for API request.
        
        Args:
            endpoint_key (str): Key from ENDPOINTS configuration
            params (dict): Query parameters
            
        Returns:
            str: Complete URL for the request
        """
        if endpoint_key not in ENDPOINTS:
            raise ValueError(f"Unknown endpoint: {endpoint_key}")
            
        endpoint = ENDPOINTS[endpoint_key]
        
        # Use different base URL for report endpoints
        if endpoint_key in ['portfolio_report', 'asset_allocation', 'performance_analysis', 
                           'consolidated_position', 'portfolio_breakdown', 'transactions']:
            base_url = BASE_REPORTS_URL
        else:
            base_url = BASE_URL
            
        url = f"{base_url}{endpoint}"
        
        if params:
            # Remove None values and empty strings
            clean_params = {k: v for k, v in params.items() if v is not None and v != ''}
            if clean_params:
                url += f"?{urlencode(clean_params)}"
                
        return url
    
    def _make_request(self, url: str, method: str = 'GET', data: Dict = None) -> Optional[Dict]:
        """
        Make HTTP request to Comdinheiro API.
        
        Args:
            url (str): Complete URL for the request
            method (str): HTTP method ('GET' or 'POST')
            data (dict): Data for POST requests
            
        Returns:
            dict: Parsed response data or None if error
        """
        try:
            if method.upper() == 'POST':
                response = self.session.post(url, data=data)
            else:
                response = self.session.get(url)
                
            response.raise_for_status()
            
            # Try to parse as JSON
            try:
                return response.json()
            except ValueError:
                # If not JSON, return raw text
                return {'raw_response': response.text}
                
        except requests.RequestException as e:
            print(f"API request error: {e}")
            return None
    
    def get_portfolio_list(self) -> Optional[list]:
        """
        Get list of available portfolios and their basic information.
        
        Returns:
            list: List of portfolio dictionaries with name, balance, and institution
        """
        current_date = datetime.now().strftime("%d%m%Y")
        
        params = {
            'data_analise': current_date,
            'data_ini': '',
            'nome_portfolio': '',
            'variaveis': 'nome_portfolio+saldo_bruto+instituicao_financeira',
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
        }
        
        url = self._build_url('portfolio_report', params)
        response = self._make_request(url)
        
        if response:
            # Import here to avoid circular imports
            from .data_processor import DataProcessor
            return DataProcessor.parse_portfolio_list(response)
        return None
    
    def get_portfolio_balance(self, portfolio: str, date: str = None) -> Optional[float]:
        """
        Get current balance for a specific portfolio.
        
        Args:
            portfolio (str): Portfolio name
            date (str): Date in YYYY-MM-DD format (default: current date)
            
        Returns:
            float: Portfolio balance or None if error
        """
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
            
        formatted_date = format_date_for_api(date)
        if not formatted_date:
            return None
            
        params = build_parameters('portfolio_balance', 
                                portfolio=portfolio, 
                                end_date=formatted_date)
        
        url = self._build_url('portfolio_report', params)
        response = self._make_request(url)
        
        if response:
            # Import here to avoid circular imports
            from .data_processor import DataProcessor
            return DataProcessor.parse_portfolio_balance(response, portfolio)
        return None
    
    def get_asset_allocation(self, portfolio: str, end_date: str = None) -> Optional[Dict]:
        """
        Get asset allocation data for a portfolio.
        
        Args:
            portfolio (str): Portfolio name
            end_date (str): End date in YYYY-MM-DD format
            
        Returns:
            dict: Asset allocation data with allocations, balance, and performance
        """
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
            
        formatted_date = format_date_for_api(end_date)
        if not formatted_date:
            return None
            
        # Get asset allocation data
        params = build_parameters('asset_allocation',
                                portfolio=portfolio,
                                start_date=formatted_date,
                                end_date=formatted_date)
        
        url = self._build_url('asset_allocation', params)
        allocation_response = self._make_request(url)
        
        if not allocation_response:
            return None
            
        # Get portfolio balance
        balance = self.get_portfolio_balance(portfolio, end_date)
        
        # Get performance data
        performance_data = self.get_performance_data(portfolio, end_date)
        
        # Import here to avoid circular imports
        from .data_processor import DataProcessor
        return DataProcessor.parse_asset_allocation(
            allocation_response, balance, performance_data
        )
    
    def get_performance_data(self, portfolio: str, end_date: str = None, 
                           start_date: str = None) -> Optional[Dict]:
        """
        Get performance/rentability data for a portfolio.
        
        Args:
            portfolio (str): Portfolio name
            end_date (str): End date in YYYY-MM-DD format
            start_date (str): Start date in YYYY-MM-DD format (default: 6 months before end_date)
            
        Returns:
            dict: Performance data including annual and 3-month returns
        """
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
            
        if not start_date:
            # Calculate 6 months before end_date
            try:
                end_dt = datetime.strptime(end_date, "%Y-%m-%d")
                # Import here to avoid circular imports
                from .data_processor import DataProcessor
                start_dt = DataProcessor.calculate_date_6_months_before(end_dt)
                start_date = start_dt.strftime("%Y-%m-%d")
            except ValueError:
                return None
                
        formatted_start = format_date_for_api(start_date)
        formatted_end = format_date_for_api(end_date)
        
        if not formatted_start or not formatted_end:
            return None
            
        params = build_parameters('performance',
                                portfolio=portfolio,
                                start_date=formatted_start,
                                end_date=formatted_end)
        
        url = self._build_url('performance_analysis', params)
        response = self._make_request(url)
        
        if response:
            # Import here to avoid circular imports
            from .data_processor import DataProcessor
            return DataProcessor.parse_performance_data(response)
        return None
    
    def get_portfolio_data(self, portfolio: str, start_date: str = None, 
                          end_date: str = None, view_type: str = DEFAULT_VIEW_TYPE,
                          bank: str = 'todos', operation: str = 'todos') -> Tuple[Optional[Dict], Optional[str]]:
        """
        Get comprehensive portfolio data based on view type.
        
        This is the main method that replaces the complex get_comdinheiro_data function.
        
        Args:
            portfolio (str): Portfolio name
            start_date (str): Start date in YYYY-MM-DD format
            end_date (str): End date in YYYY-MM-DD format
            view_type (str): Type of view ('consolidado', 'relatorio', 'movimentacoes', etc.)
            bank (str): Bank filter for transactions
            operation (str): Operation filter for transactions
            
        Returns:
            tuple: (data_dict, error_message) - data_dict is None if error occurred
        """
        # Validate and format dates
        formatted_start = format_date_for_api(start_date) if start_date else ''
        formatted_end = format_date_for_api(end_date) if end_date else ''
        
        # Get endpoint and parameter template for view type
        endpoint_key, template_name = VIEW_TYPE_MAPPING.get(
            view_type, ('portfolio_report', 'consolidated_report')
        )
        
        # Build parameters based on view type
        params = build_parameters(template_name,
                                portfolio=portfolio,
                                start_date=formatted_start,
                                end_date=formatted_end,
                                bank=bank.replace(" ", "%20") if bank else "todos",
                                operation=operation)
        
        # Make API request
        url = self._build_url(endpoint_key, params)
        response = self._make_request(url)
        
        if not response:
            return None, ERROR_MESSAGES['api_error']
            
        # Process response based on view type
        # Import here to avoid circular imports
        from .data_processor import DataProcessor
        processed_data = DataProcessor.process_response_by_view_type(
            response, view_type, portfolio
        )
        
        if processed_data is None:
            return None, ERROR_MESSAGES['no_data']
            
        return processed_data, None
    
    def export_data(self, content_data: pd.DataFrame, 
                   on_error: int = 0) -> Optional[str]:
        """
        Export data to Comdinheiro API.
        
        Args:
            content_data (pd.DataFrame): Data to export
            on_error (int): Error handling mode
            
        Returns:
            str: Response message or None if error
        """
        if on_error == 1:
            on_error = 2
            
        payload = {
            **self.credentials,
            "URL": "ComprasVendas002--0-listar-0-",
            "format": "json",
            "content": content_data.to_json(orient="records"),
            "email_log": "0",
            "on_error": on_error
        }
        
        url = self._build_url('export_data')
        response = self._make_request(url, method='POST', data=payload)
        
        if response and response.get('status_code') == 200:
            try:
                data = response
                if isinstance(data, dict) and "resposta" in data:
                    for item in data["resposta"]:
                        if isinstance(item, dict) and "Comdinheiro informa" in item:
                            mensagem_raw = item["Comdinheiro informa"]
                            mensagens = [m.strip() for m in mensagem_raw.split('.') if m.strip()]
                            return "<ul>" + "".join(f"<li>{msg}.</li>" for msg in mensagens) + "</ul>"
                return "Dados exportados com sucesso"
            except Exception as e:
                print(f"Erro ao processar resposta: {e}")
                return None
        else:
            return None
    
    def test_connection(self) -> bool:
        """
        Test API connection with current credentials.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            portfolios = self.get_portfolio_list()
            return portfolios is not None
        except Exception:
            return False