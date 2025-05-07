import React, { useState } from 'react';

function LoginUsuario() {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario, senha }),
            });

            const data = await response.text(); // Ou response.json() se o backend retornar JSON
            setMensagem(data);
            if (response.ok) {
                // Aqui você pode redirecionar o usuário ou atualizar o estado de autenticação
                setUsuario('');
                setSenha('');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setMensagem('Erro ao fazer login');
        }
    };

    return (
        <div>
            <h2>Login de Usuário</h2>
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
                    <label htmlFor="senha">Senha:</label>
                    <input
                        type="password"
                        id="senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {mensagem && <p>{mensagem}</p>}
        </div>
    );
}

export default LoginUsuario;