import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditarConteudo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [titulo, setTitulo] = useState('');
    const [texto, setTexto] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [historicoVersoes, setHistoricoVersoes] = useState([]);
    const [versaoVisualizada, setVersaoVisualizada] = useState(null); // Novo estado para a versão visualizada

    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.all([
            fetch(`http://localhost:3001/api/conteudo/${id}`),
            fetch(`http://localhost:3001/api/conteudo/${id}/versoes`)
        ])
        .then(([conteudoResponse, versoesResponse]) => {
            if (!conteudoResponse.ok) {
                throw new Error(`HTTP error! status: ${conteudoResponse.status}`);
            }
            if (!versoesResponse.ok) {
                throw new Error(`HTTP error! status: ${versoesResponse.status}`);
            }
            return Promise.all([conteudoResponse.json(), versoesResponse.json()]);
        })
        .then(([conteudoData, versoesData]) => {
            setTitulo(conteudoData.titulo);
            setTexto(conteudoData.texto);
            setHistoricoVersoes(versoesData);
            setLoading(false);
        })
        .catch(error => {
            setError(error);
            setLoading(false);
        });
    }, [id]);

    const handleVisualizarVersao = async (idVersao) => {
        try {
            const response = await fetch(`http://localhost:3001/api/versoes/${idVersao}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setVersaoVisualizada(data);
        } catch (error) {
            console.error('Erro ao buscar versão:', error);
            setMensagem('Erro ao buscar versão');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:3001/api/conteudo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, texto }),
            });

            const data = await response.text();
            setMensagem(data);
            if (response.ok) {
                navigate('/');
            }
        } catch (error) {
            console.error('Erro ao atualizar conteúdo:', error);
            setMensagem('Erro ao atualizar conteúdo');
        }
    };

    if (loading) {
        return <div>Carregando conteúdo para edição e histórico...</div>;
    }

    if (error) {
        return <div>Erro ao carregar conteúdo ou histórico: {error.message}</div>;
    }

    return (
        <div>
            <h2>Editar Conteúdo</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="titulo">Título:</label>
                    <input
                        type="text"
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="texto">Texto:</label>
                    <textarea
                        id="texto"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        rows="5"
                        required
                    />
                </div>
                <button type="submit">Salvar Edições</button>
            </form>
            {mensagem && <p>{mensagem}</p>}

            <h3>Histórico de Versões</h3>
            {historicoVersoes.length > 0 ? (
                <ul>
                    {historicoVersoes.map(versao => (
                        <li key={versao.id_versao}>
                            Versão de {new Date(versao.data_criacao).toLocaleDateString()} às {new Date(versao.data_criacao).toLocaleTimeString()}
                            <button type="button" onClick={() => handleVisualizarVersao(versao.id_versao)}>Visualizar</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhuma versão anterior encontrada.</p>
            )}

            {versaoVisualizada && (
                <div className="versao-visualizada">
                    <h4>Visualizando Versão de {new Date(versaoVisualizada.data_criacao).toLocaleDateString()} às {new Date(versaoVisualizada.data_criacao).toLocaleTimeString()}</h4>
                    <p><strong>Título:</strong> {versaoVisualizada.titulo}</p>
                    <p><strong>Texto:</strong> {versaoVisualizada.texto}</p>
                    <button onClick={() => setVersaoVisualizada(null)}>Fechar</button>
                </div>
            )}
        </div>
    );
}

export default EditarConteudo;