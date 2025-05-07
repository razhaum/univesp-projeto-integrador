import React, { useState, useEffect } from 'react';

function CriarConteudo() {
    const [titulo, setTitulo] = useState('');
    const [texto, setTexto] = useState('');
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/conteudo/criar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ titulo, texto }),
            });

            const data = await response.text(); // Ou response.json() se o backend retornar JSON
            setMensagem(data);
            if (response.ok) {
                setTitulo('');
                setTexto('');
                // Opcional: Recarregar a lista de conteúdos após a criação
            }
        } catch (error) {
            console.error('Erro ao criar conteúdo:', error);
            setMensagem('Erro ao criar conteúdo');
        }
    };

    return (
        <div>
            <h2>Criar Novo Conteúdo</h2>
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
                <button type="submit">Criar Conteúdo</button>
            </form>
            {mensagem && <p>{mensagem}</p>}
        </div>
    );
}

export default CriarConteudo;