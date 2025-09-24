# 🚀 CHECKLIST: Configuração Salesforce para Dashboard Reino

## ✅ 1. Connected App no Salesforce

- [ ] Acesse Setup → Apps → App Manager
- [ ] Clique em "New Connected App"
- [ ] Preencha as informações básicas:
  - Connected App Name: Dashboard Reino
  - API Name: Dashboard_Reino
  - Contact Email: <seu@email.com>

- [ ] Configure OAuth Settings:
  - ✅ Enable OAuth Settings
  - Callback URL: <https://localhost>
  - Selected OAuth Scopes:
    - Access and manage your data (api)
    - Perform requests on your behalf at any time (refresh_token, offline_access)
    - Access your basic information (id, profile, email, address, phone)

- [ ] Use digital signatures:
  - ✅ Enable "Use digital signatures"
  - Upload o certificado público correspondente ao server.key

## ✅ 2. Variável de Ambiente

- [ ] Configure SF_CLIENT_ID no sistema:

### Windows (PowerShell)

```powershell
[System.Environment]::SetEnvironmentVariable("SF_CLIENT_ID", "SEU_CONSUMER_KEY_AQUI", "User")
```

### Windows (CMD)

```cmd
setx SF_CLIENT_ID "SEU_CONSUMER_KEY_AQUI"
```

### Linux/Mac

```bash
export SF_CLIENT_ID="SEU_CONSUMER_KEY_AQUI"
echo 'export SF_CLIENT_ID="SEU_CONSUMER_KEY_AQUI"' >> ~/.bashrc
```

## ✅ 3. Obter Consumer Key

- [ ] No Connected App criado, vá em "View"
- [ ] Copie o "Consumer Key" (este é o SF_CLIENT_ID)

## ✅ 4. Verificar Certificado

- [ ] Confirme que existe: `scripts/app_base/certificados/server.key`
- [ ] O certificado público deve estar configurado no Connected App

## ✅ 5. Permissões do Usuário

- [ ] Usuário <placidonilo@reinocapital.com.br> deve ter:
  - API Enabled permission
  - Acesso ao objeto carteirasComDinheiro__c
  - Permissões de leitura nos campos necessários

## ✅ 6. Testar Conexão

```bash
cd scripts/app_base
python test_salesforce.py
```

## 🔧 Troubleshooting

### Erro: "invalid_client_id"

- Verifique se o SF_CLIENT_ID está correto
- Confirme que o Connected App está ativo

### Erro: "invalid_grant"

- Verifique se o certificado no Connected App corresponde ao server.key
- Confirme se o usuário tem permissões adequadas

### Erro: "invalid_signature"

- O certificado pode estar incorreto ou expirado
- Regere os certificados se necessário

## 📞 Próximos Passos

1. ✅ Complete este checklist
2. 🧪 Execute o teste: `python test_salesforce.py`
3. 🚀 Se bem-sucedido, a integração funcionará automaticamente no dashboard
