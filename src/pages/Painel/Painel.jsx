import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Painel.css';

export default function Painel() {
    const navigate = useNavigate();

    // Estado para guardar os dados do novo anúncio
    const [lote, setLote] = useState({
        titulo: '',
        categoria: 'Monitores',
        peso: '',
        local: '',
        descricao: ''
    });

    const handleInputChange = (e) => {
        setLote({ ...lote, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Num cenário real, aqui enviaríamos o 'lote' para a nossa API em Python
        console.log('Lote registado para IA avaliar e anunciar:', lote);

        alert('Lote registado com sucesso! A nossa equipa (ou IA) vai avaliar e o anúncio irá para a vitrine em breve.');

        // Redireciona o vendedor de volta para ver a vitrine
        navigate('/marketplace');
    };

    return (
        <div className="painel-page">
            <div className="painel-container">

                <div className="painel-header">
                    <h2>Anunciar Novo <span className="text-highlight">Lote</span></h2>
                    <p>Preencha os dados abaixo. A nossa IA utilizará estas informações para sugerir o melhor valor de mercado.</p>
                </div>

                <form className="painel-form" onSubmit={handleSubmit}>

                    {/* Área de Upload de Foto (Simulada) */}
                    <div className="form-group">
                        <label className="form-label">Foto dos Equipamentos</label>
                        <div className="image-dropzone">
                            <span className="dropzone-icon">📸</span>
                            <p>Clique ou arraste uma foto aqui</p>
                            <span className="dropzone-hint">Formatos suportados: JPG, PNG</span>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label className="form-label">Título do Anúncio</label>
                            <input
                                type="text"
                                name="titulo"
                                className="form-input"
                                placeholder="Ex: 20 Monitores Dell com defeito"
                                value={lote.titulo}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group flex-1">
                            <label className="form-label">Categoria</label>
                            <select
                                name="categoria"
                                className="form-input form-select"
                                value={lote.categoria}
                                onChange={handleInputChange}
                            >
                                <option value="Monitores">Monitores</option>
                                <option value="Servidores / Placas">Servidores / Placas</option>
                                <option value="Notebooks">Notebooks</option>
                                <option value="Misto">Lote Misto</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label className="form-label">Peso Estimado</label>
                            <input
                                type="text"
                                name="peso"
                                className="form-input"
                                placeholder="Ex: 50kg"
                                value={lote.peso}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group flex-1">
                            <label className="form-label">Localização (Cidade, UF)</label>
                            <input
                                type="text"
                                name="local"
                                className="form-input"
                                placeholder="Ex: Curitiba, PR"
                                value={lote.local}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Descrição Adicional</label>
                        <textarea
                            name="descricao"
                            className="form-input form-textarea"
                            placeholder="Descreva o estado dos equipamentos, se possuem cabos, se há peças em falta, etc."
                            rows="4"
                            value={lote.descricao}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-submit">
                        Publicar Anúncio
                    </button>

                </form>
            </div>
        </div>
    );
}