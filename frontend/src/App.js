import React, { useState, useEffect } from 'react';
import './App.css';
import CadastroUsuario from './components/CadastroUsuario';
import LoginUsuario from './components/LoginUsuario';
import CriarConteudo from './components/CriarConteudo';
import EditarConteudo from './components/EditarConteudo'; // Importe o componente de edição
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Importe os componentes de roteamento

function App() {
    const [conteudos, setConteudos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/api/conteudo')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setConteudos(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Carregando conteúdos...</div>;
    }

    if (error) {
        return <div>Erro ao carregar conteúdos: {error.message}</div>;
    }

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Meu Sistema Web</h1>
                    <nav>
                        <Link to="/cadastro">Cadastro</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/criar">Criar Conteúdo</Link>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/cadastro" element={<CadastroUsuario />} />
                        <Route path="/login" element={<LoginUsuario />} />
                        <Route path="/criar" element={<CriarConteudo />} />
                        <Route path="/editar/:id" element={<EditarConteudo />} />
                        <Route path="/" element={
                            <>
                                <h2>Lista de Conteúdos</h2>
                                <ul>
                                    {conteudos.map(conteudo => (
                                        <li key={conteudo.id}>
                                            <h2>{conteudo.titulo}</h2>
                                            <p>{conteudo.texto}</p>
                                            <small>Criado em: {new Date(conteudo.data_criacao).toLocaleDateString()}</small>
                                            <Link to={`/editar/${conteudo.id}`}>Editar</Link> {/* Link para a página de edição */}
                                        </li>
                                    ))}
                                    {conteudos.length === 0 && !loading && <p>Nenhum conteúdo cadastrado.</p>}
                                </ul>
                            </>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;