import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import "./Dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [lote, setLote] = useState({
        titulo: '',
        categoria: 'Monitores',
        peso_kg: '',
        cidade: '',
        estado: '',
        descricao: ''
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usuarioData, setUsuarioData] = useState(null);
    const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);

    useEffect(() => {
        const carregarUsuario = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const meta = session.user.user_metadata;
                setUsuarioData({
                    email: session.user.email,
                    nome: meta?.nome || '',
                    telefone: meta?.telefone || '',
                });
                return;
            }
            const usuarioStr = localStorage.getItem('usuario');
            if (usuarioStr) {
                try { setUsuarioData(JSON.parse(usuarioStr)); }
                catch { navigate('/login'); }
            } else {
                navigate('/login');
            }
        };
        carregarUsuario();
    }, [navigate]);

    const handleInputChange = (e) => setLote({ ...lote, [e.target.name]: e.target.value });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            alert('Por favor, selecione uma imagem JPG ou PNG.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            alert('Por favor, arraste uma imagem JPG ou PNG.');
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
    const handleDropzoneClick = () => fileInputRef.current.click();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!usuarioData || !selectedImage) {
                alert('Erro: usuário não identificado ou imagem não selecionada.');
                setIsSubmitting(false);
                return;
            }

            let empresaId = null;

            const { data: empresaExistente } = await supabase
                .from('empresas')
                .select('id')
                .eq('email', usuarioData.email)
                .limit(1);

            if (empresaExistente && empresaExistente.length > 0) {
                empresaId = empresaExistente[0].id;
            } else {
                const { data: novaEmpresa, error: criarError } = await supabase
                    .from('empresas')
                    .insert([{
                        nome: usuarioData.nome || 'Sem Nome',
                        email: usuarioData.email,
                        telefone: usuarioData.telefone || ''
                    }])
                    .select()
                    .limit(1);

                if (criarError) throw new Error(`Erro ao criar perfil: ${criarError.message}`);
                if (!novaEmpresa || novaEmpresa.length === 0) throw new Error('Não foi possível criar o perfil da empresa.');
                empresaId = novaEmpresa[0].id;
            }

            const nomeArquivo = `${Date.now()}-${selectedImage.name}`;
            const { error: uploadError } = await supabase.storage
                .from('lotes-fotos')
                .upload(nomeArquivo, selectedImage);

            if (uploadError) throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);

            const { data: publicUrlData } = supabase.storage
                .from('lotes-fotos')
                .getPublicUrl(nomeArquivo);

            const { error: insertError } = await supabase
                .from('lotes')
                .insert([{
                    empresa_id: empresaId,
                    titulo: lote.titulo,
                    categoria: lote.categoria,
                    peso_kg: parseFloat(lote.peso_kg),
                    cidade: lote.cidade,
                    estado: lote.estado,
                    descricao: lote.descricao,
                    foto_url: publicUrlData.publicUrl,
                    status: 'disponivel',
                    created_at: new Date().toISOString()
                }]);

            if (insertError) throw new Error(`Erro ao criar lote: ${insertError.message}`);

            setMostrarModalSucesso(true);
            setLote({ titulo: '', categoria: 'Monitores', peso_kg: '', cidade: '', estado: '', descricao: '' });
            setSelectedImage(null);
            setImagePreview(null);

        } catch (error) {
            console.error('Erro:', error);
            alert(`Erro ao publicar lote: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const iniciais = usuarioData?.nome
        ? usuarioData.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <>
            <div className="Dashboard-page">
                <div className="Dashboard-container">

                    <div className="Dashboard-header">
                        <h2>Anunciar Novo <span className="text-highlight">Lote</span></h2>
                        <p>Preencha os dados abaixo para cadastrar e publicar seu lote na plataforma.</p>
                    </div>

                    <form className="Dashboard-form" onSubmit={handleSubmit}>

                        {/* Card do anunciante */}
                        {usuarioData && (
                            <div className="anunciante-card">
                                <div className="anunciante-avatar">{iniciais}</div>
                                <div className="anunciante-dados">
                                    <span className="anunciante-nome">{usuarioData.nome || 'Usuário'}</span>
                                    <span className="anunciante-detalhe">{usuarioData.email}</span>
                                    {usuarioData.telefone && (
                                        <span className="anunciante-detalhe">{usuarioData.telefone}</span>
                                    )}
                                </div>
                                <span className="anunciante-badge">Anunciante</span>
                            </div>
                        )}

                        {/* Upload de foto */}
                        <div className={`form-group ${!selectedImage ? 'form-group--error' : 'form-group--success'}`}>
                            <label className="form-label">Foto dos Equipamentos</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/jpeg,image/png"
                                style={{ display: 'none' }}
                                disabled={isSubmitting}
                            />
                            <div
                                className={`image-dropzone ${isDragOver ? 'drag-over' : ''}`}
                                onClick={handleDropzoneClick}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" className="preview-image" />
                                        <p className="preview-text">Imagem: {selectedImage.name}</p>
                                    </div>
                                ) : (
                                    <>
                                        <span className="dropzone-icon">📸</span>
                                        <p>Clique ou arraste uma foto aqui</p>
                                        <span className="dropzone-hint">Formatos suportados: JPG, PNG</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className={`form-group flex-2 ${!lote.titulo ? 'form-group--error' : 'form-group--success'}`}>
                                <label className="form-label">Título do Anúncio</label>
                                <input
                                    type="text"
                                    name="titulo"
                                    className="form-input"
                                    placeholder="Ex: 20 Monitores Dell com defeito"
                                    value={lote.titulo}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group flex-1">
                                <label className="form-label">Categoria</label>
                                <select
                                    name="categoria"
                                    className="form-input form-select"
                                    value={lote.categoria}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                >
                                    <option value="Monitores">Monitores</option>
                                    <option value="Servidores / Placas">Servidores / Placas</option>
                                    <option value="Notebooks">Notebooks</option>
                                    <option value="Misto">Lote Misto</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className={`form-group flex-1 ${!lote.peso_kg ? 'form-group--error' : 'form-group--success'}`}>
                                <label className="form-label">Peso Estimado (kg)</label>
                                <input
                                    type="number"
                                    name="peso_kg"
                                    className="form-input"
                                    placeholder="Ex: 50"
                                    value={lote.peso_kg}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className={`form-group flex-1 ${!lote.cidade ? 'form-group--error' : 'form-group--success'}`}>
                                <label className="form-label">Cidade</label>
                                <input
                                    type="text"
                                    name="cidade"
                                    className="form-input"
                                    placeholder="Ex: Curitiba"
                                    value={lote.cidade}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className={`form-group flex-1 ${!lote.estado ? 'form-group--error' : 'form-group--success'}`}>
                                <label className="form-label">Estado (UF)</label>
                                <input
                                    type="text"
                                    name="estado"
                                    className="form-input"
                                    placeholder="Ex: PR"
                                    maxLength="2"
                                    value={lote.estado}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className={`form-group ${!lote.descricao ? 'form-group--error' : 'form-group--success'}`}>
                            <label className="form-label">Descrição Adicional</label>
                            <textarea
                                name="descricao"
                                className="form-input form-textarea"
                                placeholder="Descreva o estado dos equipamentos, se possuem cabos, se há peças em falta, etc."
                                rows="4"
                                value={lote.descricao}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting || !lote.titulo || !lote.peso_kg || !lote.cidade || !lote.estado || !lote.descricao || !selectedImage}
                        >
                            {isSubmitting ? '⏳ Publicando...' : '✨ Publicar Anúncio'}
                        </button>

                    </form>
                </div>
            </div>

            {/* --- MODAL DE SUCESSO --- */}
            {mostrarModalSucesso && (
                <div className="sucesso-modal-backdrop">
                    <div className="sucesso-modal-container">
                        <div className="sucesso-modal-icon">✅</div>
                        <h3 className="sucesso-modal-titulo">Lote publicado!</h3>
                        <p className="sucesso-modal-texto">Seu anúncio já está disponível no Marketplace para os recicladores.</p>
                        <button
                            className="sucesso-modal-btn"
                            onClick={() => { setMostrarModalSucesso(false); navigate('/marketplace'); }}
                        >
                            Ver no Marketplace
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}