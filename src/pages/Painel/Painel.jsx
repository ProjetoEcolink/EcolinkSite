import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; 
import './Painel.css';

export default function Painel() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Estado inicial do lote
    const [lote, setLote] = useState({
        titulo: '',
        categoria: 'Notebooks',
        peso: '',
        local: '',
        descricao: ''
    });

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // ID que você recuperou do banco para vincular o anúncio
    const EMPRESA_ID_VALIDO = 'cae98f44-9b56-4514-9937-e6edaef6e86c';

    const handleInputChange = (e) => {
        setLote({ ...lote, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let foto_url = null;

            // 1. Upload da Imagem (Opcional, mas funcional)
            if (file) {
                const fileName = `${Date.now()}-${file.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('lotes-fotos')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('lotes-fotos')
                    .getPublicUrl(fileName);
                
                foto_url = urlData.publicUrl;
            }

            // 2. Tratamento da Localização (Divide "Curitiba, PR" em Cidade e Estado)
            const localPartes = lote.local.split(',');
            const cidadeFormatada = localPartes[0] ? localPartes[0].trim() : lote.local;
            const estadoFormatado = localPartes[1] ? localPartes[1].trim().toUpperCase() : '';

            // 3. Inserção no Banco de Dados
            const { error: insertError } = await supabase
                .from('lotes')
                .insert([
                    {
                        titulo: lote.titulo,
                        categoria: lote.categoria,
                        peso_kg: parseFloat(lote.peso.replace(',', '.')), // Garante que vire número
                        cidade: cidadeFormatada,
                        estado: estadoFormatado,
                        descricao: lote.descricao,
                        foto_url: foto_url,
                        status: 'disponivel', // Crucial para aparecer no Marketplace
                        empresa_id: EMPRESA_ID_VALIDO
                    }
                ]);

            if (insertError) throw insertError;

            alert('Sucesso! O Laptop da Xuxa (ou seu lote) já está na vitrine.');
            navigate('/marketplace');

        } catch (error) {
            console.error('Erro detalhado:', error);
            alert('Erro ao publicar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="painel-page">
            <div className="painel-container">

                <div className="painel-header">
                    <h2>Anunciar Novo <span className="text-highlight">Lote</span></h2>
                    <p>Preencha os dados abaixo para que nossa IA e compradores avaliem seu material.</p>
                </div>

                <form className="painel-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label className="form-label">Foto dos Equipamentos</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            style={{ display: 'none' }} 
                        />
                        <div 
                            className="image-dropzone" 
                            onClick={triggerFileSelect}
                            style={preview ? { backgroundImage: `url(${preview})`, borderStyle: 'solid' } : {}}
                        >
                            {!preview && (
                                <>
                                    <span className="dropzone-icon">📸</span>
                                    <p>Clique para enviar a foto</p>
                                    <span className="dropzone-hint">PNG ou JPG</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label className="form-label">Título do Anúncio</label>
                            <input
                                type="text"
                                name="titulo"
                                className="form-input"
                                placeholder="Ex: Laptop da Xuxa com defeito"
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
                                <option value="Notebooks">Notebooks</option>
                                <option value="Monitores">Monitores</option>
                                <option value="Servidores / Placas">Servidores / Placas</option>
                                <option value="Misto">Lote Misto</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label className="form-label">Peso Estimado (kg)</label>
                            <input
                                type="text"
                                name="peso"
                                className="form-input"
                                placeholder="Ex: 1.0"
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
                                placeholder="Curitiba, PR"
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
                            placeholder="Descreva o estado do item..."
                            rows="4"
                            value={lote.descricao}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Publicando...' : 'Publicar no Marketplace'}
                    </button>

                </form>
            </div>
        </div>
    );
}