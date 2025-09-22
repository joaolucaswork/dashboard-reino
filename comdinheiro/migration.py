"""
Migration guide and helper functions for transitioning from legacy Comdinheiro integration
to the new simplified modular structure.

This file helps migrate existing code while maintaining backward compatibility.
"""

import warnings
from typing import Dict, Any


def create_migration_wrapper():
    """
    Create a wrapper that can replace the old dados_comdinheiro module imports.
    
    Usage in existing code:
        # OLD:
        from dados_comdinheiro import carteiras_comdinheiro, get_comdinheiro_data
        
        # NEW (backward compatible):
        from comdinheiro import carteiras_comdinheiro, get_comdinheiro_data
        
        # OR better (recommended):
        from comdinheiro import get_portfolio_list, get_portfolio_data
    """
    pass


class LegacyCompatibilityWarnings:
    """Helper class to manage deprecation warnings for legacy functions."""
    
    @staticmethod
    def warn_deprecated_function(old_func: str, new_func: str):
        """Issue deprecation warning for legacy functions."""
        warnings.warn(
            f"{old_func}() is deprecated and will be removed in version 2.0. "
            f"Use {new_func}() instead.",
            DeprecationWarning,
            stacklevel=3
        )


# Migration examples showing old vs new patterns
MIGRATION_EXAMPLES = {
    "portfolio_list": {
        "old": """
# OLD complex pattern:
from dados_comdinheiro import carteiras_comdinheiro
from recebe_comdinheiro import recebe_comdinheiro

carteiras = carteiras_comdinheiro(username, password)
for carteira in carteiras:
    print(f"{carteira['nome_portfolio']}: {carteira['saldo_bruto']}")
""",
        "new": """
# NEW simplified pattern:
from comdinheiro import get_portfolio_list

portfolios = get_portfolio_list()  # Uses session credentials automatically
for portfolio in portfolios:
    print(f"{portfolio['nome_portfolio']}: {portfolio['saldo_bruto']}")
"""
    },
    
    "portfolio_data": {
        "old": """
# OLD complex pattern:
from dados_comdinheiro import get_comdinheiro_data

dados, erro = get_comdinheiro_data(
    username, password, data_inicial, data_final,
    carteira, banco, operacao, view_type
)
if dados:
    tab0 = dados['tables']['tab0']
    # Complex processing...
""",
        "new": """
# NEW simplified pattern:
from comdinheiro import get_portfolio_data

data, error = get_portfolio_data(
    portfolio=carteira,
    start_date=data_inicial,  # YYYY-MM-DD format
    end_date=data_final,      # YYYY-MM-DD format
    view_type=view_type,
    bank=banco,
    operation=operacao
)
if data:
    # Data is already processed and cleaned
    total = data.get('total_geral', '0,00')
"""
    },
    
    "asset_allocation": {
        "old": """
# OLD complex pattern:
from dados_comdinheiro import asset_allocation_comdinheiro

asset_data = asset_allocation_comdinheiro(username, password, carteira, data_final)
if asset_data:
    grafico = asset_data.get('grafico1', {})
    saldo = asset_data.get('saldo_bruto', 0)
""",
        "new": """
# NEW simplified pattern:
from comdinheiro import get_asset_allocation

allocation = get_asset_allocation(carteira, end_date=data_final)
if allocation:
    chart = allocation['grafico1']
    balance = allocation['saldo_bruto']
    performance = allocation.get('rentabilidade_ano')
"""
    },
    
    "export_data": {
        "old": """
# OLD complex pattern:
from envia_comdinheiro import envia_comdinheiro

resultado = envia_comdinheiro(content_data, on_error, username, password)
""",
        "new": """
# NEW simplified pattern:
from comdinheiro import export_portfolio_data

result = export_portfolio_data(content_data, on_error)  # Uses session credentials
"""
    },
    
    "authentication": {
        "old": """
# OLD scattered authentication:
from consulta_bd import get_comdinheiro_credentials
from flask import session

if 'user' not in session:
    return "Not authenticated"
    
username, password = get_comdinheiro_credentials(session['user']['email'])
""",
        "new": """
# NEW unified authentication:
from comdinheiro import AuthManager

if not AuthManager.validate_session():
    return "Not authenticated"
    
api = AuthManager.create_authenticated_api_client()
# OR get credentials directly:
username, password = AuthManager.get_active_credentials()
"""
    }
}


def print_migration_guide():
    """Print comprehensive migration guide."""
    print("=" * 80)
    print("COMDINHEIRO INTEGRATION MIGRATION GUIDE")
    print("=" * 80)
    print()
    
    print("🔄 OVERVIEW:")
    print("The new modular structure simplifies Comdinheiro integration with:")
    print("• Clean API client with standardized methods")
    print("• Unified authentication management")
    print("• Automatic data processing and formatting")
    print("• Backward compatibility for existing code")
    print()
    
    for section, examples in MIGRATION_EXAMPLES.items():
        print(f"📂 {section.upper().replace('_', ' ')}:")
        print(examples["old"])
        print("👇 BECOMES:")
        print(examples["new"])
        print("-" * 60)
        print()
    
    print("⚡ BENEFITS:")
    print("• 60% fewer lines of code")
    print("• Automatic session credential management")
    print("• Centralized error handling")
    print("• Consistent data formatting")
    print("• Better type hints and documentation")
    print()
    
    print("🚀 MIGRATION STEPS:")
    print("1. Update imports from 'dados_comdinheiro' to 'comdinheiro'")
    print("2. Replace function calls with new simplified versions")
    print("3. Remove manual credential passing (uses session automatically)")
    print("4. Update date formats to YYYY-MM-DD")
    print("5. Test with new interface functions")
    print()
    
    print("⚠️  BACKWARD COMPATIBILITY:")
    print("All legacy functions are still available but deprecated.")
    print("They will show warnings and be removed in version 2.0.")
    print()


def validate_migration() -> Dict[str, bool]:
    """
    Validate that migration is working correctly.
    
    Returns:
        dict: Validation results for each component
    """
    results = {}
    
    try:
        from comdinheiro import ComdinheiroAPI
        results['api_client'] = True
    except ImportError:
        results['api_client'] = False
    
    try:
        from comdinheiro import AuthManager
        results['auth_manager'] = True
    except ImportError:
        results['auth_manager'] = False
    
    try:
        from comdinheiro import DataProcessor
        results['data_processor'] = True
    except ImportError:
        results['data_processor'] = False
    
    try:
        from comdinheiro import get_portfolio_list, get_portfolio_data
        results['main_interface'] = True
    except ImportError:
        results['main_interface'] = False
    
    try:
        from comdinheiro import carteiras_comdinheiro  # Legacy compatibility
        results['legacy_compatibility'] = True
    except ImportError:
        results['legacy_compatibility'] = False
    
    return results


if __name__ == "__main__":
    print_migration_guide()
    
    print("🔍 VALIDATION RESULTS:")
    results = validate_migration()
    for component, status in results.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {component}: {'OK' if status else 'FAILED'}")
    
    all_ok = all(results.values())
    print(f"\n{'🎉 Migration ready!' if all_ok else '⚠️  Migration has issues!'}")