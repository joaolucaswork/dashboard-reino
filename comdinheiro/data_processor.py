"""
Standardized data processing for Comdinheiro API responses.

This module centralizes all data transformation and processing logic,
replacing the scattered parsing patterns with clean, reusable methods.
"""

import re
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from math import isclose


class DataProcessor:
    """
    Standardized data processor for all Comdinheiro API responses.
    
    This class centralizes data parsing, transformation, and formatting logic,
    replacing the inline processing patterns with clean, testable methods.
    """
    
    @staticmethod
    def calculate_date_6_months_before(reference_date: datetime) -> datetime:
        """
        Calculate date 6 months before the reference date.
        
        Args:
            reference_date (datetime): Reference date
            
        Returns:
            datetime: Date 6 months before reference
        """
        try:
            # Try to subtract 6 months
            new_month = reference_date.month - 6
            new_year = reference_date.year

            # Adjust if month is negative
            if new_month <= 0:
                new_month += 12
                new_year -= 1

            # Create new date maintaining day, but adjusting if necessary
            new_day = min(reference_date.day, 28)  # Safe for any month
            return datetime(new_year, new_month, new_day)
        except Exception:
            # Fallback: subtract 180 days (approximately 6 months)
            return reference_date - timedelta(days=180)
    
    @staticmethod
    def parse_brazilian_currency(value: str) -> float:
        """
        Parse Brazilian currency string to float.
        
        Args:
            value (str): Currency string (e.g., "1.234.567,89")
            
        Returns:
            float: Parsed numeric value
        """
        if not value or isinstance(value, (int, float)):
            return float(value) if value else 0.0
            
        try:
            # Remove thousands separator and replace decimal comma with dot
            clean_value = str(value).replace('.', '').replace(',', '.')
            return float(clean_value) if clean_value else 0.0
        except (ValueError, TypeError):
            return 0.0
    
    @staticmethod
    def format_brazilian_currency(value: float) -> str:
        """
        Format float value to Brazilian currency format.
        
        Args:
            value (float): Numeric value
            
        Returns:
            str: Formatted currency string
        """
        try:
            formatted = '{:,.2f}'.format(value)
            return formatted.replace(',', '_').replace('.', ',').replace('_', '.')
        except (ValueError, TypeError):
            return "0,00"
    
    @staticmethod
    def decode_special_characters(value: str) -> str:
        """
        Decode special characters from API response.
        
        Args:
            value (str): String with encoded characters
            
        Returns:
            str: Decoded string
        """
        if not isinstance(value, str):
            return str(value) if value is not None else ""
            
        try:
            return value.encode('latin-1').decode('utf-8').strip().strip('"')
        except (UnicodeDecodeError, AttributeError):
            return value.strip().strip('"')
    
    @staticmethod
    def clean_table_data(table_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Clean and process table data from API response.
        
        Args:
            table_data (dict): Raw table data from API
            
        Returns:
            dict: Cleaned table data
        """
        cleaned_data = {}
        
        for row_key, row_data in table_data.items():
            cleaned_row = {}
            
            for col_key, value in row_data.items():
                if isinstance(value, str):
                    decoded_value = DataProcessor.decode_special_characters(value)
                    
                    # Don't modify year column (col0)
                    if col_key == "col0":
                        cleaned_row[col_key] = decoded_value
                        continue
                    
                    # Try to parse as number
                    numeric_value = DataProcessor.parse_brazilian_currency(decoded_value)
                    if decoded_value.replace('.', '').replace(',', '').replace('-', '').isdigit():
                        cleaned_row[col_key] = numeric_value
                    else:
                        cleaned_row[col_key] = decoded_value
                else:
                    cleaned_row[col_key] = value
                    
            cleaned_data[row_key] = cleaned_row
            
        return cleaned_data
    
    @staticmethod
    def parse_portfolio_list(response_data: Dict) -> Optional[List[Dict]]:
        """
        Parse portfolio list from API response.
        
        Args:
            response_data (dict): Raw API response
            
        Returns:
            list: List of portfolio dictionaries
        """
        if not response_data or 'tables' not in response_data or 'tab0' not in response_data['tables']:
            return None
            
        tab0 = response_data['tables']['tab0']
        portfolios = []
        
        for key, row in tab0.items():
            if key != 'lin0':  # Skip header
                name = row.get('col0', '').strip()
                balance = row.get('col1', '').strip()
                institution = row.get('col2', '').strip()
                
                portfolios.append({
                    'nome_portfolio': name,
                    'saldo_bruto': balance,
                    'instituicao': institution
                })
        
        return portfolios
    
    @staticmethod
    def parse_portfolio_balance(response_data: Dict, portfolio_name: str) -> Optional[float]:
        """
        Parse portfolio balance from API response.
        
        Args:
            response_data (dict): Raw API response
            portfolio_name (str): Name of the portfolio to find
            
        Returns:
            float: Portfolio balance or None if not found
        """
        if not response_data or 'tables' not in response_data or 'tab0' not in response_data['tables']:
            return None
            
        tab0 = response_data['tables']['tab0']
        
        for key, row in tab0.items():
            if key != 'lin0':  # Skip header
                name = row.get('col0', '').strip()
                balance_str = row.get('col1', '0')
                
                # Check if it's the correct portfolio
                if name.lower() == portfolio_name.lower():
                    return DataProcessor.parse_brazilian_currency(balance_str)
        
        # If specific portfolio not found, return first balance (fallback behavior)
        for key, row in tab0.items():
            if key != 'lin0':
                balance_str = row.get('col1', '0')
                return DataProcessor.parse_brazilian_currency(balance_str)
                
        return None
    
    @staticmethod
    def parse_asset_allocation(allocation_response: Dict, balance: float = None, 
                             performance_data: Dict = None) -> Optional[Dict]:
        """
        Parse asset allocation data from API response.
        
        Args:
            allocation_response (dict): Raw allocation API response
            balance (float): Portfolio balance
            performance_data (dict): Performance data
            
        Returns:
            dict: Processed asset allocation data
        """
        if not allocation_response:
            return None
            
        # Get original chart data
        original_chart = None
        if 'resposta' in allocation_response and 'grafico1' in allocation_response['resposta']:
            original_chart = allocation_response['resposta']['grafico1']
        elif 'grafico1' in allocation_response:
            original_chart = allocation_response['grafico1']
        else:
            return {
                'grafico1': {},
                'saldo_bruto': balance or 0.0,
                'erro': 'Não foi possível obter dados de Asset Allocation'
            }
        
        # Process data to combine RV + Multimercado
        processed_chart = {}
        rv_mm_total = 0.0
        
        for category, percentage in original_chart.items():
            try:
                value = float(percentage) if percentage else 0.0
            except (ValueError, TypeError):
                value = 0.0
            
            # Combine Renda Variável and Multimercado into RV + MM
            if category.lower() in ['renda variável', 'multimercado', 'renda variavel']:
                rv_mm_total += value
            else:
                # Keep other categories as they are
                processed_chart[category] = value
        
        # Add RV + MM category with combined value
        if rv_mm_total > 0:
            processed_chart['RV'] = rv_mm_total
        
        result = {
            'grafico1': processed_chart,
            'saldo_bruto': balance or 0.0
        }
        
        # Add performance data if available
        if performance_data:
            result.update(performance_data)
            
        return result
    
    @staticmethod
    def parse_performance_data(response_data: Dict) -> Optional[Dict]:
        """
        Parse performance/rentability data from API response.
        
        Args:
            response_data (dict): Raw API response
            
        Returns:
            dict: Performance data with annual and 3-month returns
        """
        if not response_data or 'tables' not in response_data or 'tab1' not in response_data['tables']:
            return None
            
        tab1 = response_data['tables']['tab1']
        
        # Find column indices for "Ano" and "03meses" in header
        col_ano_index = None
        col_3meses_index = None
        
        if 'lin0' in tab1:
            for col_key, header_value in tab1['lin0'].items():
                if isinstance(header_value, str):
                    header_lower = header_value.lower().strip()
                    if header_lower == 'ano':
                        col_ano_index = col_key
                    elif header_lower == '03meses':
                        col_3meses_index = col_key
        
        # Find "Percent CDI (%)" row and extract values
        rentabilidade_ano = None
        rentabilidade_3meses = None
        
        if col_ano_index or col_3meses_index:
            for line_key, line_data in tab1.items():
                if line_key != 'lin0' and 'col0' in line_data:
                    line_name = line_data.get('col0', '').strip()
                    if 'percent cdi' in line_name.lower():
                        # Extract annual value
                        if col_ano_index:
                            valor_ano = line_data.get(col_ano_index, '')
                            rentabilidade_ano = DataProcessor._parse_percentage(valor_ano)
                        
                        # Extract 3-month value
                        if col_3meses_index:
                            valor_3meses = line_data.get(col_3meses_index, '')
                            rentabilidade_3meses = DataProcessor._parse_percentage(valor_3meses)
                        
                        break
        
        return {
            'rentabilidade_ano': rentabilidade_ano,
            'rentabilidade_3meses': rentabilidade_3meses
        }
    
    @staticmethod
    def _parse_percentage(value: Any) -> Optional[str]:
        """
        Parse percentage value from API response.
        
        Args:
            value: Raw percentage value
            
        Returns:
            str: Formatted percentage string or None
        """
        try:
            if isinstance(value, str):
                clean_value = value.replace('.', '').replace(',', '.').replace('%', '').strip()
                if clean_value and clean_value.lower() != 'nd':
                    return f"{float(clean_value):.2f}%"
            elif value:
                return f"{float(value):.2f}%"
            return None
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def process_response_by_view_type(response_data: Dict, view_type: str, 
                                    portfolio: str) -> Optional[Dict]:
        """
        Process API response based on view type.
        
        Args:
            response_data (dict): Raw API response
            view_type (str): Type of view being processed
            portfolio (str): Portfolio name
            
        Returns:
            dict: Processed data or None if error
        """
        if not response_data or 'tables' not in response_data or 'tab0' not in response_data['tables']:
            return None
            
        # Clean the table data
        tab0 = DataProcessor.clean_table_data(response_data['tables']['tab0'])
        
        # Process based on view type
        if view_type == "relatorio":
            return DataProcessor._process_detailed_report(tab0)
        elif view_type == "consolidado":
            return DataProcessor._process_consolidated_report(tab0)
        elif view_type == "movimentacoes":
            return DataProcessor._process_transactions(tab0)
        else:
            # Default processing
            return {'tables': {'tab0': tab0}}
    
    @staticmethod
    def _process_detailed_report(tab0: Dict) -> Dict:
        """Process detailed report data with percentage calculations."""
        total_float = 0.0
        
        # Add difference column to header
        tab0['lin0']['col_diff'] = 'Diferença %'
        
        for key, row in tab0.items():
            if key == "lin0":
                continue
                
            # Sum col5 values
            value = row.get('col5', '')
            try:
                total_float += DataProcessor.parse_brazilian_currency(value)
            except Exception:
                pass
            
            # Calculate percentage difference between col8 and col7
            col7_raw = row.get('col7', 0)
            col8_raw = row.get('col8', 0)
            
            try:
                col7 = float(col7_raw)
                col8 = float(col8_raw)
                
                if col7 != 0:
                    diff_percent = ((col8 - col7) / col7) * 100
                    formatted = DataProcessor.format_brazilian_currency(diff_percent) + '%'
                    
                    if diff_percent > 0:
                        row['col_diff'] = f'<span style="color:green;">⬆ {formatted}</span>'
                    elif diff_percent < 0:
                        row['col_diff'] = f'<span style="color:red;">⬇ {formatted}</span>'
                    else:
                        row['col_diff'] = formatted
                else:
                    row['col_diff'] = "--"
            except Exception:
                row['col_diff'] = "--"
        
        # Format total
        total_geral = DataProcessor.format_brazilian_currency(total_float)
        
        return {
            'tables': {'tab0': tab0},
            'total_geral': total_geral
        }
    
    @staticmethod
    def _process_consolidated_report(tab0: Dict) -> Dict:
        """Process consolidated report data."""
        total_geral_float = 0.0
        
        for key, row in tab0.items():
            if key == "lin0":
                continue
                
            # Sum col5 values for total
            value = row.get('col5', '')
            try:
                total_geral_float += DataProcessor.parse_brazilian_currency(value)
            except Exception:
                pass
        
        total_geral = DataProcessor.format_brazilian_currency(total_geral_float)
        
        return {
            'tables': {'tab0': tab0},
            'total_geral': total_geral
        }
    
    @staticmethod
    def _process_transactions(tab0: Dict) -> Dict:
        """Process transaction data."""
        # Simple processing for transaction data
        return {'tables': {'tab0': tab0}}