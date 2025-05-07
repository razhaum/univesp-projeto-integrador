import React, { useState } from 'react';

function CadastroUsuario() {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [email, setEmail] = useState('');
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/usuarios/cadastro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario, senha, email }),
            });

            const data = await response.text(); // Ou response.json() se o backend retornar JSON
            setMensagem(data);
            if (response.ok) {
                setUsuario('');
                setSenha('');
                setEmail('');
            }
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            setMensagem('Erro ao cadastrar usuário');
        }
    };

    return (
        <div>
            <h2>Cadastro de Usuário</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="usuario">Usuário:</label>
                    <input
                        type="text"
                        id="usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="senha">Senha:</label>
                    <input
                        type="password"
                        id="senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Cadastrar</button>
            </form>
            {mensagem && <p>{mensagem}</p>}
        </div>
    );
}

export default CadastroUsuario;