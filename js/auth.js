// Configurações do seu Supabase
const SUPABASE_URL = 'https://gdvauwtjddkguhzsptop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkdmF1d3RqZGRrZ3VoenNwdG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzUxMTEsImV4cCI6MjA4NTg1MTExMX0.3hFOQGY18MMTIhLWcSL8rkYHWXHnI1EUymTC17_rKrY';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        document.getElementById('message').innerText = "Erro: " + error.message;
    } else {
        // Redireciona para o painel após o login
        window.location.href = 'dashboard.html';
    }
});