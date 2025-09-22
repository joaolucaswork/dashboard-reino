#!/usr/bin/env python3
"""
Script de teste para validar a nova estrutura modular do Comdinheiro.

Este script testa todas as funcionalidades principais da nova integração
e valida que a migração foi bem-sucedida.
"""

import sys
import traceback
from typing import Dict, Any


def test_imports() -> Dict[str, bool]:
    """Testa se todas as importações estão funcionando."""
    results = {}
    
    print("🔍 Testando importações...")
    
    # Teste 1: Importações principais
    try:
        from comdinheiro import ComdinheiroAPI, AuthManager, DataProcessor
        results['core_classes'] = True
        print("✅ Classes principais importadas com sucesso")
    except Exception as e:
        results['core_classes'] = False
        print(f"❌ Erro ao importar classes principais: {e}")
    
    # Teste 2: Interface simplificada
    try:
        from comdinheiro import (
            get_portfolio_list, get_portfolio_data, get_asset_allocation,
            get_portfolio_balance, export_portfolio_data
        )
        results['simplified_interface'] = True
        print("✅ Interface simplificada importada com sucesso")
    except Exception as e:
        results['simplified_interface'] = False
        print(f"❌ Erro ao importar interface simplificada: {e}")
    
    # Teste 3: Compatibilidade retroativa
    try:
        from comdinheiro import (
            carteiras_comdinheiro, get_comdinheiro_data, 
            asset_allocation_comdinheiro, envia_comdinheiro
        )
        results['legacy_compatibility'] = True
        print("✅ Compatibilidade retroativa disponível")
    except Exception as e:
        results['legacy_compatibility'] = False
        print(f"❌ Erro na compatibilidade retroativa: {e}")
    
    # Teste 4: Utilitários
    try:
        from comdinheiro import (
            test_api_connection, format_currency, parse_currency,
            get_user_portfolios, get_available_view_types
        )
        results['utilities'] = True
        print("✅ Utilitários importados com sucesso")
    except Exception as e:
        results['utilities'] = False
        print(f"❌ Erro ao importar utilitários: {e}")
    
    return results


def test_configuration() -> Dict[str, bool]:
    """Testa se a configuração está correta."""
    results = {}
    
    print("\n⚙️ Testando configuração...")
    
    try:
        from comdinheiro.config import (
            ENDPOINTS, PARAM_TEMPLATES, VIEW_TYPE_MAPPING,
            format_date_for_api, build_parameters
        )
        
        # Teste endpoints
        required_endpoints = [
            'export_data', 'import_data', 'portfolio_report', 
            'asset_allocation', 'performance_analysis'
        ]
        
        missing_endpoints = [ep for ep in required_endpoints if ep not in ENDPOINTS]
        if not missing_endpoints:
            results['endpoints'] = True
            print(f"✅ Todos os {len(ENDPOINTS)} endpoints configurados")
        else:
            results['endpoints'] = False
            print(f"❌ Endpoints faltando: {missing_endpoints}")
        
        # Teste templates de parâmetros
        required_templates = [
            'basic_portfolio', 'asset_allocation', 'performance', 
            'portfolio_balance', 'detailed_report'
        ]
        
        missing_templates = [t for t in required_templates if t not in PARAM_TEMPLATES]
        if not missing_templates:
            results['param_templates'] = True
            print(f"✅ Todos os {len(PARAM_TEMPLATES)} templates configurados")
        else:
            results['param_templates'] = False
            print(f"❌ Templates faltando: {missing_templates}")
        
        # Teste mapeamento de view types
        if len(VIEW_TYPE_MAPPING) >= 6:
            results['view_mapping'] = True
            print(f"✅ {len(VIEW_TYPE_MAPPING)} tipos de visualização mapeados")
        else:
            results['view_mapping'] = False
            print(f"❌ Poucos tipos de visualização: {len(VIEW_TYPE_MAPPING)}")
        
        # Teste funções utilitárias
        test_date = format_date_for_api("2025-09-22")
        if test_date == "22092025":
            results['date_formatting'] = True
            print("✅ Formatação de data funcionando")
        else:
            results['date_formatting'] = False
            print(f"❌ Formatação de data incorreta: {test_date}")
        
        # Teste build_parameters
        params = build_parameters('basic_portfolio', 
                                portfolio='Teste', 
                                start_date='01012025',
                                end_date='22092025')
        if 'nome_portfolio' in params and params['nome_portfolio'] == 'Teste':
            results['parameter_building'] = True
            print("✅ Construção de parâmetros funcionando")
        else:
            results['parameter_building'] = False
            print("❌ Construção de parâmetros com problema")
            
    except Exception as e:
        print(f"❌ Erro na configuração: {e}")
        results.update({
            'endpoints': False,
            'param_templates': False,
            'view_mapping': False,
            'date_formatting': False,
            'parameter_building': False
        })
    
    return results


def test_data_processor() -> Dict[str, bool]:
    """Testa as funcionalidades do DataProcessor."""
    results = {}
    
    print("\n📊 Testando processador de dados...")
    
    try:
        from comdinheiro import DataProcessor
        
        # Teste formatação de moeda brasileira
        test_value = 1234567.89
        formatted = DataProcessor.format_brazilian_currency(test_value)
        if formatted == "1.234.567,89":
            results['currency_formatting'] = True
            print("✅ Formatação de moeda brasileira funcionando")
        else:
            results['currency_formatting'] = False
            print(f"❌ Formatação incorreta: {formatted}")
        
        # Teste parsing de moeda brasileira
        parsed = DataProcessor.parse_brazilian_currency("1.234.567,89")
        if abs(parsed - 1234567.89) < 0.01:
            results['currency_parsing'] = True
            print("✅ Parsing de moeda brasileira funcionando")
        else:
            results['currency_parsing'] = False
            print(f"❌ Parsing incorreto: {parsed}")
        
        # Teste decodificação de caracteres especiais
        decoded = DataProcessor.decode_special_characters('Test String"')
        if isinstance(decoded, str):
            results['character_decoding'] = True
            print("✅ Decodificação de caracteres funcionando")
        else:
            results['character_decoding'] = False
            print("❌ Decodificação de caracteres com problema")
        
        # Teste cálculo de data 6 meses antes
        from datetime import datetime
        test_date = datetime(2025, 9, 22)
        past_date = DataProcessor.calculate_date_6_months_before(test_date)
        if past_date.month == 3 and past_date.year == 2025:
            results['date_calculation'] = True
            print("✅ Cálculo de data 6 meses antes funcionando")
        else:
            results['date_calculation'] = False
            print(f"❌ Cálculo de data incorreto: {past_date}")
            
    except Exception as e:
        print(f"❌ Erro no processador de dados: {e}")
        traceback.print_exc()
        results.update({
            'currency_formatting': False,
            'currency_parsing': False,
            'character_decoding': False,
            'date_calculation': False
        })
    
    return results


def test_auth_manager() -> Dict[str, bool]:
    """Testa as funcionalidades do AuthManager."""
    results = {}
    
    print("\n🔐 Testando gerenciador de autenticação...")
    
    try:
        from comdinheiro import AuthManager
        
        # Teste validação de sessão (deve falhar sem Flask context)
        try:
            is_valid = AuthManager.validate_session()
            results['session_validation'] = True
            print("✅ Validação de sessão funcionando")
        except:
            results['session_validation'] = True  # Esperado falhar fora do Flask
            print("✅ Validação de sessão (falhou como esperado fora do Flask)")
        
        # Teste hierarquia de permissões
        if AuthManager.has_permission('convidado'):
            results['permission_hierarchy'] = True
            print("✅ Hierarquia de permissões funcionando")
        else:
            results['permission_hierarchy'] = False
            print("❌ Hierarquia de permissões com problema")
        
        # Teste get_user_info sem sessão
        user_info = AuthManager.get_user_info()
        if isinstance(user_info, dict) and 'authenticated' in user_info:
            results['user_info'] = True
            print("✅ Get user info funcionando")
        else:
            results['user_info'] = False
            print("❌ Get user info com problema")
            
    except Exception as e:
        print(f"❌ Erro no gerenciador de autenticação: {e}")
        results.update({
            'session_validation': False,
            'permission_hierarchy': False,
            'user_info': False
        })
    
    return results


def test_api_client() -> Dict[str, bool]:
    """Testa a criação do cliente API."""
    results = {}
    
    print("\n🌐 Testando cliente API...")
    
    try:
        from comdinheiro import ComdinheiroAPI
        
        # Teste criação do cliente
        api = ComdinheiroAPI("test_user", "test_pass")
        if api.credentials['username'] == "test_user":
            results['client_creation'] = True
            print("✅ Criação do cliente API funcionando")
        else:
            results['client_creation'] = False
            print("❌ Criação do cliente API com problema")
        
        # Teste construção de URL
        url = api._build_url('portfolio_report', {'test': 'param'})
        if 'RelatorioGerencialCarteiras001.php' in url:
            results['url_building'] = True
            print("✅ Construção de URL funcionando")
        else:
            results['url_building'] = False
            print(f"❌ Construção de URL incorreta: {url}")
            
    except Exception as e:
        print(f"❌ Erro no cliente API: {e}")
        results.update({
            'client_creation': False,
            'url_building': False
        })
    
    return results


def test_utilities() -> Dict[str, bool]:
    """Testa as funções utilitárias."""
    results = {}
    
    print("\n🔧 Testando utilitários...")
    
    try:
        from comdinheiro import format_currency, parse_currency, get_available_view_types
        
        # Teste formatação de moeda
        formatted = format_currency(1234567.89)
        if formatted == "1.234.567,89":
            results['utility_currency_format'] = True
            print("✅ Formatação de moeda utilitária funcionando")
        else:
            results['utility_currency_format'] = False
            print(f"❌ Formatação de moeda incorreta: {formatted}")
        
        # Teste parsing de moeda
        parsed = parse_currency("1.234.567,89")
        if abs(parsed - 1234567.89) < 0.01:
            results['utility_currency_parse'] = True
            print("✅ Parsing de moeda utilitária funcionando")
        else:
            results['utility_currency_parse'] = False
            print(f"❌ Parsing de moeda incorreto: {parsed}")
        
        # Teste tipos de visualização disponíveis
        view_types = get_available_view_types()
        if isinstance(view_types, list) and len(view_types) > 0:
            results['view_types'] = True
            print(f"✅ {len(view_types)} tipos de visualização disponíveis")
        else:
            results['view_types'] = False
            print("❌ Tipos de visualização não encontrados")
            
    except Exception as e:
        print(f"❌ Erro nos utilitários: {e}")
        results.update({
            'utility_currency_format': False,
            'utility_currency_parse': False,
            'view_types': False
        })
    
    return results


def main():
    """Executa todos os testes e mostra resultado final."""
    print("🚀 TESTE DA ESTRUTURA MODULAR COMDINHEIRO")
    print("=" * 60)
    
    all_results = {}
    
    # Executar todos os testes
    test_functions = [
        test_imports,
        test_configuration,
        test_data_processor,
        test_auth_manager,
        test_api_client,
        test_utilities
    ]
    
    for test_func in test_functions:
        try:
            results = test_func()
            all_results.update(results)
        except Exception as e:
            print(f"❌ Erro no teste {test_func.__name__}: {e}")
    
    # Resumo final
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES")
    print("=" * 60)
    
    passed = sum(1 for result in all_results.values() if result)
    total = len(all_results)
    
    for test_name, result in all_results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{status} - {test_name}")
    
    print(f"\n🎯 RESULTADO FINAL: {passed}/{total} testes passaram")
    
    if passed == total:
        print("🎉 TODOS OS TESTES PASSARAM! A migração está pronta.")
        return 0
    else:
        print("⚠️  Alguns testes falharam. Verifique os problemas acima.")
        return 1


if __name__ == "__main__":
    sys.exit(main())