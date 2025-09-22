"""
Unified authentication manager for Salesforce + Comdinheiro integration.

This module centralizes all authentication logic, replacing the scattered
credential management patterns with a clean, secure interface.
"""

from typing import Tuple, Optional
from flask import session


class AuthManager:
    """
    Unified authentication manager for Salesforce + Comdinheiro integration.
    
    This class centralizes authentication logic and credential management,
    replacing the complex authentication chains with simple, secure methods.
    """
    
    @staticmethod
    def validate_session() -> bool:
        """
        Validate current Flask session for Salesforce authentication.
        
        Returns:
            bool: True if session is valid and user is authenticated
        """
        required_keys = ['user', 'token']
        
        if not all(key in session for key in required_keys):
            return False
            
        if not session.get('user', {}).get('email'):
            return False
            
        return True
    
    @staticmethod
    def get_user_email() -> Optional[str]:
        """
        Get authenticated user's email from session.
        
        Returns:
            str: User email or None if not authenticated
        """
        if not AuthManager.validate_session():
            return None
            
        return session['user'].get('email')
    
    @staticmethod
    def get_user_group() -> str:
        """
        Get user's permission group from session.
        
        Returns:
            str: User group ('admin', 'gestor', 'convidado')
        """
        if not AuthManager.validate_session():
            return 'convidado'
            
        return session.get('grupo', 'convidado')
    
    @staticmethod
    def get_comdinheiro_credentials(user_email: str = None) -> Tuple[Optional[str], Optional[str]]:
        """
        Get Comdinheiro credentials for the authenticated user.
        
        Args:
            user_email (str, optional): User email. If None, gets from session.
            
        Returns:
            tuple: (username, password) or (None, None) if not found
        """
        if not user_email:
            user_email = AuthManager.get_user_email()
            
        if not user_email:
            return None, None
            
        try:
            # Try to import consulta_bd if available
            try:
                from consulta_bd import get_comdinheiro_credentials
                return get_comdinheiro_credentials(user_email)
            except ImportError:
                # Fallback implementation if consulta_bd is not available
                return AuthManager._get_credentials_fallback(user_email)
        except Exception as e:
            print(f"Error getting credentials: {e}")
            return None, None
    
    @staticmethod
    def _get_credentials_fallback(user_email: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Fallback method to get credentials when consulta_bd is not available.
        
        This method should query the database directly using a standard connection.
        
        Args:
            user_email (str): User email
            
        Returns:
            tuple: (username, password) or (None, None) if not found
        """
        try:
            import psycopg2
            import os
            
            # Get database connection parameters from environment or config
            db_params = {
                'host': os.getenv('DB_HOST', 'localhost'),
                'database': os.getenv('DB_NAME', 'dashboard_reino'),
                'user': os.getenv('DB_USER', 'postgres'),
                'password': os.getenv('DB_PASSWORD', ''),
                'port': os.getenv('DB_PORT', '5432')
            }
            
            with psycopg2.connect(**db_params) as conn:
                with conn.cursor() as cursor:
                    query = """
                        SELECT comdinheiro_username, comdinheiro_password 
                        FROM comdinheiro_credenciais 
                        WHERE salesforce_user_id = %s
                    """
                    cursor.execute(query, (user_email,))
                    result = cursor.fetchone()
                    
                    if result:
                        return result[0], result[1]
                    return None, None
                    
        except Exception as e:
            print(f"Error getting credentials: {e}")
            return None, None
    
    @staticmethod
    def get_active_credentials() -> Tuple[Optional[str], Optional[str]]:
        """
        Get Comdinheiro credentials for the currently authenticated user.
        
        This is the main method that should be used throughout the application
        to get credentials for API calls.
        
        Returns:
            tuple: (username, password) or (None, None) if not authenticated
        """
        if not AuthManager.validate_session():
            return None, None
            
        user_email = AuthManager.get_user_email()
        return AuthManager.get_comdinheiro_credentials(user_email)
    
    @staticmethod
    def create_authenticated_api_client():
        """
        Create a ComdinheiroAPI client with current user's credentials.
        
        Returns:
            ComdinheiroAPI: Authenticated API client or None if no credentials
        """
        username, password = AuthManager.get_active_credentials()
        
        if not username or not password:
            return None
            
        from .api_client import ComdinheiroAPI
        return ComdinheiroAPI(username, password)
    
    @staticmethod
    def has_permission(required_group: str = 'convidado') -> bool:
        """
        Check if current user has required permission level.
        
        Args:
            required_group (str): Required permission level
                                'admin' > 'gestor' > 'convidado'
        
        Returns:
            bool: True if user has required permission
        """
        user_group = AuthManager.get_user_group()
        
        permission_hierarchy = {
            'convidado': 0,
            'gestor': 1,
            'admin': 2
        }
        
        user_level = permission_hierarchy.get(user_group, 0)
        required_level = permission_hierarchy.get(required_group, 0)
        
        return user_level >= required_level
    
    @staticmethod
    def get_user_info() -> dict:
        """
        Get comprehensive user information from session.
        
        Returns:
            dict: User information including email, group, and permissions
        """
        if not AuthManager.validate_session():
            return {
                'authenticated': False,
                'email': None,
                'group': 'convidado',
                'permissions': {}
            }
            
        user_email = AuthManager.get_user_email()
        user_group = AuthManager.get_user_group()
        
        return {
            'authenticated': True,
            'email': user_email,
            'group': user_group,
            'permissions': {
                'can_view_data': True,
                'can_edit_portfolios': AuthManager.has_permission('gestor'),
                'can_manage_users': AuthManager.has_permission('admin'),
                'can_export_data': AuthManager.has_permission('gestor')
            }
        }
    
    @staticmethod
    def require_authentication(func):
        """
        Decorator to require authentication for Flask routes.
        
        Usage:
            @app.route('/protected')
            @AuthManager.require_authentication
            def protected_route():
                return "Protected content"
        """
        from functools import wraps
        from flask import redirect, url_for, jsonify, request
        
        @wraps(func)
        def decorated_function(*args, **kwargs):
            if not AuthManager.validate_session():
                if request.is_json:
                    return jsonify({'error': 'Authentication required'}), 401
                return redirect(url_for('login'))
            return func(*args, **kwargs)
        return decorated_function
    
    @staticmethod
    def require_permission(required_group: str = 'convidado'):
        """
        Decorator to require specific permission level for Flask routes.
        
        Args:
            required_group (str): Required permission level
            
        Usage:
            @app.route('/admin')
            @AuthManager.require_permission('admin')
            def admin_route():
                return "Admin content"
        """
        def decorator(func):
            from functools import wraps
            from flask import jsonify, request, abort
            
            @wraps(func)
            def decorated_function(*args, **kwargs):
                if not AuthManager.validate_session():
                    if request.is_json:
                        return jsonify({'error': 'Authentication required'}), 401
                    abort(401)
                    
                if not AuthManager.has_permission(required_group):
                    if request.is_json:
                        return jsonify({'error': 'Insufficient permissions'}), 403
                    abort(403)
                    
                return func(*args, **kwargs)
            return decorated_function
        return decorator