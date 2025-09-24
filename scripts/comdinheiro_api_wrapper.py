#!/usr/bin/env python3
"""
Wrapper script for the new Comdinheiro module to be called from SvelteKit API routes.

This script acts as a bridge between the SvelteKit frontend and the new
simplified Comdinheiro Python module.
"""

import sys
import json
import os
import warnings
import logging
from datetime import datetime
from pathlib import Path

# Suppress ALL logging and warnings
warnings.filterwarnings("ignore")
logging.getLogger().disabled = True
os.environ['PYTHONPATH'] = str(Path(__file__).parent.parent)

# Suppress stdout/stderr from requests and other libraries
import io
from contextlib import redirect_stdout, redirect_stderr

# Add the parent directory to the path to import the comdinheiro module
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

def main():
    """Main function to handle API requests."""
    try:
        # Read command line arguments
        if len(sys.argv) < 2:
            raise ValueError("Missing required arguments")
        
        # Parse JSON input from command line argument
        request_data = json.loads(sys.argv[1])
        
        action = request_data.get('action')
        
        # Use context manager to suppress ALL output from imports and API calls
        # Create a null file to redirect everything to
        with open(os.devnull, 'w') as devnull:
            with redirect_stdout(devnull), redirect_stderr(devnull):
                if action == 'get_portfolio_data':
                    result = handle_portfolio_data(request_data)
                elif action == 'test_connection':
                    result = handle_test_connection(request_data)
                elif action == 'get_portfolio_list':
                    result = handle_portfolio_list(request_data)
                else:
                    raise ValueError(f"Unknown action: {action}")
        
        # Only print the JSON result - nothing else
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "type": type(e).__name__
        }
        print(json.dumps(error_result))
        sys.exit(1)


def handle_portfolio_data(request_data):
    """Handle portfolio data requests."""
    # Import here to avoid output pollution during module load
    from comdinheiro import get_portfolio_data
    
    portfolio = request_data.get('portfolio')
    end_date = request_data.get('end_date')
    view_type = request_data.get('view_type', 'consolidado')
    username = request_data.get('username')
    password = request_data.get('password')
    
    if not portfolio:
        raise ValueError("Portfolio name is required")
    if not end_date:
        raise ValueError("End date is required")
    
    # Validate date format
    try:
        datetime.strptime(end_date, '%Y-%m-%d')
    except ValueError:
        raise ValueError("Invalid date format. Use YYYY-MM-DD")
    
    if not username or not password:
        raise ValueError("Username and password are required")
    
    # Call the new simplified function
    data, error = get_portfolio_data(
        portfolio=portfolio,
        end_date=end_date,
        view_type=view_type,
        username=username,
        password=password
    )
    
    if error:
        return {
            "success": False,
            "error": error
        }
    
    return {
        "success": True,
        "data": data
    }


def handle_test_connection(request_data):
    """Test API connection."""
    # Import here to avoid output pollution during module load
    from comdinheiro.api_client import ComdinheiroAPI
    
    username = request_data.get('username')
    password = request_data.get('password')
    
    if not username or not password:
        raise ValueError("Username and password are required for connection test")
    
    try:
        api = ComdinheiroAPI(username, password)
        
        # Try a simple API call that should work or fail cleanly
        result = api.get_portfolio_list()
        
        return {
            "success": True,
            "message": "Connection test successful",
            "portfolios_found": len(result) if result else 0
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Connection test failed: {str(e)}"
        }


def handle_portfolio_list(request_data):
    """Get list of available portfolios."""
    # Import here to avoid output pollution during module load
    from comdinheiro import get_portfolio_list
    
    username = request_data.get('username')
    password = request_data.get('password')
    
    if not username or not password:
        raise ValueError("Username and password are required")
    
    try:
        portfolios = get_portfolio_list(username=username, password=password)
        
        return {
            "success": True,
            "portfolios": portfolios
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    main()