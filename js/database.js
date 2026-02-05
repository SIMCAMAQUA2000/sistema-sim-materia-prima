// Configurações do Supabase (Mesmas do auth.js)
const SUPABASE_URL = 'https://gdvauwtjddkguhzsptop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkdmF1d3RqZGRrZ3VoenNwdG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzUxMTEsImV4cCI6MjA4NTg1MTExMX0.3hFOQGY18MMTIhLWcSL8rkYHWXHnI1EUymTC17_rKrY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Carregar dados da empresa ao abrir o Dashboard
async function carregarPerfil() {
    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) { window.location.href = 'index.html'; return; }

    const { data: perfil } = await _supabase
        .from('perfis_empresas')
        .select('*')
        .eq('id', user.id)
        .single();

    if (perfil) {
        document.getElementById('nome-empresa').innerText = perfil.nome_fantasia;
        document.getElementById('logo-exibicao').src = perfil.logo_url;
    }
    listarLancamentos(user.id);
}

// 2. Salvar Lançamento
const formProducao = document.getElementById('form-producao');
formProducao.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { data: { user } } = await _supabase.auth.getUser();

    const novoLancamento = {
        empresa_id: user.id,
        descricao_produto: document.getElementById('produto').value,
        quantidade: document.getElementById('quantidade').value,
        status_assinatura: 'Pendente'
    };

    const { error } = await _supabase.from('lancamentos').insert([novoLancamento]);

    if (error) alert("Erro ao salvar: " + error.message);
    else {
        alert("Lançado com sucesso!");
        formProducao.reset();
        listarLancamentos(user.id);
    }
});

// 3. Listar Lançamentos na Tabela
async function listarLancamentos(userId) {
    const { data: lancamentos } = await _supabase
        .from('lancamentos')
        .select('*')
        .eq('empresa_id', userId)
        .order('data_lancamento', { ascending: false });

    const corpoTabela = document.getElementById('corpo-tabela');
    corpoTabela.innerHTML = '';

    lancamentos.forEach(item => {
        corpoTabela.innerHTML += `
            <tr>
                <td>${new Date(item.data_lancamento).toLocaleDateString()}</td>
                <td>${item.descricao_produto}</td>
                <td>${item.quantidade}</td>
                <td>${item.status_assinatura}</td>
            </tr>
        `;
    });
}

// 4. Logout
async function logout() {
    await _supabase.auth.signOut();
    window.location.href = 'index.html';
}

async function gerarRelatorioPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { data: { user } } = await _supabase.auth.getUser();

    // Busca dados da empresa para o cabeçalho
    const { data: perfil } = await _supabase.from('perfis_empresas').select('*').eq('id', user.id).single();
    const { data: lancamentos } = await _supabase.from('lancamentos').select('*').eq('empresa_id', user.id);

    // Cabeçalho
    doc.setFontSize(18);
    doc.text(`Relatório de Produção - ${perfil.nome_fantasia}`, 20, 20);
    doc.setFontSize(10);
    doc.text(`CNPJ: ${perfil.cnpj}`, 20, 30);
    
    // Lista de Lançamentos
    let y = 50;
    doc.text("Data | Produto | Quantidade", 20, y);
    lancamentos.forEach(l => {
        y += 10;
        doc.text(`${new Date(l.data_lancamento).toLocaleDateString()} | ${l.descricao_produto} | ${l.quantidade} kg`, 20, y);
    });

    doc.save(`relatorio_${perfil.nome_fantasia}.pdf`);
}
carregarPerfil();