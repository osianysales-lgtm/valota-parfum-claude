#!/usr/bin/env node

/**
 * Meta Ads API - Fetch Accounts
 * Consulta a API do Meta Ads para trazer todas as contas disponíveis
 * para o token fornecido no .env
 */

require('dotenv').config();

const axios = require('axios');

const METAADS_TOKEN = process.env.METAADS_TOKEN;
const API_VERSION = 'v20.0'; // Use a versão mais recente disponível
const GRAPH_API_BASE = `https://graph.instagram.com/${API_VERSION}`;

async function getMetaAdAccounts() {
  try {
    console.log('🔄 Buscando contas Meta Ads...\n');

    if (!METAADS_TOKEN) {
      throw new Error('❌ METAADS_TOKEN não encontrado no .env');
    }

    // Primeiro, pega o usuário logado
    const meResponse = await axios.get(`${GRAPH_API_BASE}/me`, {
      params: {
        fields: 'id,name,email',
        access_token: METAADS_TOKEN,
      },
    });

    console.log('✅ Usuário logado:');
    console.log(`   ID: ${meResponse.data.id}`);
    console.log(`   Nome: ${meResponse.data.name}`);
    console.log(`   Email: ${meResponse.data.email || 'N/A'}\n`);

    // Agora busca as contas de anúncios vinculadas
    const accountsResponse = await axios.get(`${GRAPH_API_BASE}/me/adaccounts`, {
      params: {
        fields: 'id,name,currency,timezone_name,account_status,business_name',
        limit: 100,
        access_token: METAADS_TOKEN,
      },
    });

    const accounts = accountsResponse.data.data;

    if (accounts.length === 0) {
      console.log('⚠️  Nenhuma conta de anúncios encontrada.');
      return [];
    }

    console.log(`📊 Total de contas encontradas: ${accounts.length}\n`);
    console.log('📋 LISTA DE CONTAS:');
    console.log('='.repeat(80));

    accounts.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.name}`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Status: ${getStatusLabel(account.account_status)}`);
      console.log(`   Moeda: ${account.currency || 'N/A'}`);
      console.log(`   Timezone: ${account.timezone_name || 'N/A'}`);
      console.log(`   Business: ${account.business_name || 'N/A'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\n✨ Todas as ${accounts.length} contas foram listadas com sucesso!\n`);

    return accounts;
  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na API:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensagem: ${error.response.data.error?.message || error.message}`);
    } else {
      console.error('❌ Erro:', error.message);
    }
    process.exit(1);
  }
}

function getStatusLabel(status) {
  const statusMap = {
    1: '✅ Ativa',
    2: '⏸️  Suspensa',
    3: '❌ Desativada',
    9: '🔒 Bloqueada Pelo Business',
    100: '⚠️  Pendente',
  };
  return statusMap[status] || `Status ${status}`;
}

// Exportar para uso em módulos
module.exports = { getMetaAdAccounts };

// Executar se for chamado diretamente
if (require.main === module) {
  getMetaAdAccounts();
}
