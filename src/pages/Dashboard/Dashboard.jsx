import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import {
    buildLegacyLotePayload,
    buildLotePayload,
    MAX_FOTOS_LOTE,
    normalizeMateriaisLote,
    sanitizePesoInput,
    TIPOS_MATERIAIS_PADRAO,
} from '../../utils/loteUtils';
import './Dashboard.css';

async function getOrCreateEmpresaId(usuarioData) {
    const { data: empresaExistente, error: erroBusca } = await supabase
        .from('empresas')
        .select('id')
        .eq('email', usuarioData.email)
        .limit(1);

    if (erroBusca) {
        throw new Error(`Erro ao buscar empresa: ${erroBusca.message}`);
    }

    if (empresaExistente?.length) {
        return empresaExistente[0].id;
    }

    const { data: novaEmpresa, error: erroCriacao } = await supabase
        .from('empresas')
        .insert([
            {
                nome: usuarioData.nome || 'Sem Nome',
                email: usuarioData.email,
                telefone: usuarioData.telefone || '',
            },
        ])
        .select()
        .limit(1);

    if (erroCriacao) {
        throw new Error(`Erro ao criar empresa: ${erroCriacao.message}`);
    }

    if (!novaEmpresa?.length) {
        throw new Error('Não foi possível criar a empresa deste usuário.');
    }

    return novaEmpresa[0].id;
}

async function uploadLoteImages(files) {
    const uploadedUrls = [];

    for (const file of files) {
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('lotes-fotos').upload(safeName, file);

        if (uploadError) {
            throw new Error(`Erro ao enviar imagem ${file.name}: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage.from('lotes-fotos').getPublicUrl(safeName);
        uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls;
}

async function resolveLocationByBrowser() {
    if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada neste navegador.');
    }

    const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 0,
        });
    });

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    if (!response.ok) {
        throw new Error('Falha ao buscar endereço da localização atual.');
    }

    const data = await response.json();
    const address = data.address || {};
    const cidade = address.city || address.town || address.village || address.municipality || '';
    const estado = address.state_code || address.state || '';
    const rua = address.road || '';
    const numero = address.house_number || '';

    const local = [rua, numero, cidade, estado].filter(Boolean).join(', ') || data.display_name || 'Local não identificado';

    return {
        local_lote: local,
        cidade,
        estado: estado?.slice(0, 2).toUpperCase(),
    };
}

export default function Dashboard() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [lote, setLote] = useState({
        titulo: '',
        tipo_material: 'Notebook',
        peso_kg: '',
        numero_itens: '',
        materiais_lote: '',
        local_lote: '',
        cidade: '',
        estado: '',
        descricao_resumida: '',
        descricao_completa: '',
    });

    const [files, setFiles] = useState([]);
    const [materialOptions, setMaterialOptions] = useState(TIPOS_MATERIAIS_PADRAO);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
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
            if (!usuarioStr) {
                navigate('/login');
                return;
            }

            try {
                setUsuarioData(JSON.parse(usuarioStr));
            } catch {
                navigate('/login');
            }
        };

        carregarUsuario();
    }, [navigate]);

    useEffect(() => {
        const carregarMateriais = async () => {
            const { data, error } = await supabase
                .from('categorias')
                .select('nome_material')
                .order('nome_material', { ascending: true });

            if (!error && data?.length) {
                setMaterialOptions(data.map((item) => item.nome_material));
            }
        };

        carregarMateriais();
    }, []);

    const previews = useMemo(
        () => files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
        [files],
    );

    useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.preview)), [previews]);

    const iniciais = usuarioData?.nome
        ? usuarioData.nome.split(' ').map((nome) => nome[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'peso_kg') {
            setLote((prev) => ({ ...prev, [name]: sanitizePesoInput(value) }));
            return;
        }

        if (name === 'numero_itens') {
            setLote((prev) => ({ ...prev, [name]: String(value || '').replace(/\D/g, '') }));
            return;
        }

        setLote((prev) => ({ ...prev, [name]: value }));
    };

    const applySelectedFiles = (selectedFiles) => {
        const allowed = selectedFiles.filter((file) => /image\/(jpeg|jpg|png|webp)/.test(file.type));
        if (!allowed.length) {
            alert('Selecione imagens JPG, PNG ou WEBP.');
            return;
        }

        setFiles((prev) => {
            const next = [...prev, ...allowed].slice(0, MAX_FOTOS_LOTE);
            if (prev.length + allowed.length > MAX_FOTOS_LOTE) {
                alert(`Limite de ${MAX_FOTOS_LOTE} fotos por lote.`);
            }
            return next;
        });
    };

    const handleFileSelect = (e) => {
        applySelectedFiles(Array.from(e.target.files || []));
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        applySelectedFiles(Array.from(e.dataTransfer.files || []));
    };

    const handleDropzoneClick = () => fileInputRef.current?.click();

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const preencherLocalizacao = async () => {
        setIsLocating(true);
        try {
            const locationData = await resolveLocationByBrowser();
            setLote((prev) => ({ ...prev, ...locationData }));
        } catch (error) {
            alert(error.message || 'Não foi possível obter localização automática agora.');
        } finally {
            setIsLocating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!usuarioData) {
            alert('Usuário não identificado. Faça login novamente.');
            return;
        }

        if (!files.length) {
            alert('Adicione pelo menos 1 foto do lote.');
            return;
        }

        if (!lote.local_lote) {
            alert('Preencha o local pelo botão "Usar minha localização".');
            return;
        }

        if (!lote.numero_itens) {
            alert('Informe a quantidade de itens do lote.');
            return;
        }

        if (Number(lote.numero_itens) <= 0) {
            alert('Quantidade de itens deve ser maior que zero.');
            return;
        }

        if (!normalizeMateriaisLote(lote.materiais_lote).length) {
            alert('Informe todos os materiais contidos no lote.');
            return;
        }

        setIsSubmitting(true);
        try {
            const empresaId = await getOrCreateEmpresaId(usuarioData);
            const fotoUrls = await uploadLoteImages(files);

            const payloadNovo = buildLotePayload(lote, empresaId, fotoUrls);
            const { error: erroNovo } = await supabase.from('lotes').insert([payloadNovo]);

            if (erroNovo) {
                const payloadLegado = buildLegacyLotePayload(lote, empresaId, fotoUrls);
                const { error: erroLegado } = await supabase.from('lotes').insert([payloadLegado]);
                if (erroLegado) {
                    throw new Error(erroNovo.message || erroLegado.message);
                }
            }

            setMostrarModalSucesso(true);
            setLote({
                titulo: '',
                tipo_material: materialOptions[0] || 'Notebook',
                peso_kg: '',
                numero_itens: '',
                materiais_lote: '',
                local_lote: '',
                cidade: '',
                estado: '',
                descricao_resumida: '',
                descricao_completa: '',
            });
            setFiles([]);
        } catch (error) {
            alert(`Erro ao publicar lote: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formValid =
        lote.titulo.trim() &&
        lote.tipo_material &&
        lote.numero_itens &&
        normalizeMateriaisLote(lote.materiais_lote).length > 0 &&
        lote.local_lote &&
        lote.descricao_resumida.trim() &&
        lote.descricao_completa.trim() &&
        files.length > 0;

    return (
        <>
            <div className="Dashboard-page">
                <div className="Dashboard-container">
                    <div className="Dashboard-header">
                        <h2>Anunciar Novo <span className="text-highlight">Lote</span></h2>
                        <p>Cadastre seu lote com dados completos. O local é preenchido automaticamente via API.</p>
                    </div>

                    <form className="Dashboard-form" onSubmit={handleSubmit}>
                        {usuarioData && (
                            <div className="anunciante-card">
                                <div className="anunciante-avatar">{iniciais}</div>
                                <div className="anunciante-dados">
                                    <span className="anunciante-nome">{usuarioData.nome || 'Usuário'}</span>
                                    <span className="anunciante-detalhe">{usuarioData.email}</span>
                                    {usuarioData.telefone && <span className="anunciante-detalhe">{usuarioData.telefone}</span>}
                                </div>
                                <span className="anunciante-badge">Anunciante</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Fotos do lote (máx. {MAX_FOTOS_LOTE})</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: 'none' }}
                                disabled={isSubmitting}
                            />

                            <div
                                className={`image-dropzone ${isDragOver ? 'drag-over' : ''}`}
                                onClick={handleDropzoneClick}
                                onDrop={handleDrop}
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                            >
                                <span className="dropzone-icon">📸</span>
                                <p>Clique ou arraste até {MAX_FOTOS_LOTE} imagens</p>
                                <span className="dropzone-hint">JPG, PNG e WEBP</span>
                            </div>

                            {previews.length > 0 && (
                                <div className="multi-image-grid">
                                    {previews.map((item, index) => (
                                        <figure key={`${item.file.name}-${index}`} className="multi-image-item">
                                            <img src={item.preview} alt={item.file.name} className="preview-image" />
                                            <figcaption className="preview-text">{item.file.name}</figcaption>
                                            <button
                                                type="button"
                                                className="btn-remove-image"
                                                onClick={() => removeFile(index)}
                                                aria-label={`Remover foto ${index + 1}`}
                                            >
                                                ×
                                            </button>
                                        </figure>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-2">
                                <label className="form-label">Título do anúncio</label>
                                <input
                                    type="text"
                                    name="titulo"
                                    className="form-input"
                                    placeholder="Ex: Lote de notebooks para reaproveitamento"
                                    value={lote.titulo}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group flex-1">
                                <label className="form-label">Tipo de material</label>
                                <select
                                    name="tipo_material"
                                    className="form-input form-select"
                                    value={lote.tipo_material}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                >
                                    {materialOptions.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">Peso do lote (kg)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    name="peso_kg"
                                    className="form-input"
                                    placeholder="Ex: 35.5 (opcional)"
                                    value={lote.peso_kg}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group flex-1">
                                <label className="form-label">Quantidade de itens</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="numero_itens"
                                    className="form-input"
                                    placeholder="Ex: 120"
                                    value={lote.numero_itens}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-group flex-2">
                                <label className="form-label">Local do lote (API)</label>
                                <div className="local-row">
                                    <input
                                        type="text"
                                        name="local_lote"
                                        className="form-input"
                                        value={lote.local_lote}
                                        placeholder="Clique em usar minha localização"
                                        readOnly
                                        disabled
                                    />
                                    <button type="button" className="btn-localizar" onClick={preencherLocalizacao} disabled={isLocating || isSubmitting}>
                                        {isLocating ? 'Buscando...' : 'Usar minha localização'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label className="form-label">Cidade</label>
                                <input type="text" name="cidade" className="form-input" value={lote.cidade} readOnly disabled />
                            </div>
                            <div className="form-group flex-1">
                                <label className="form-label">Estado</label>
                                <input type="text" name="estado" className="form-input" value={lote.estado} readOnly disabled />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Materiais no lote (todos)</label>
                            <textarea
                                name="materiais_lote"
                                className="form-input form-textarea"
                                placeholder="Ex:\nNotebooks Dell\nMonitores Samsung\nCabos HDMI"
                                rows="4"
                                value={lote.materiais_lote}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descrição resumida</label>
                            <input
                                type="text"
                                name="descricao_resumida"
                                className="form-input"
                                placeholder="Resumo rápido para card do marketplace"
                                value={lote.descricao_resumida}
                                onChange={handleInputChange}
                                maxLength={180}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descrição completa</label>
                            <textarea
                                name="descricao_completa"
                                className="form-input form-textarea"
                                placeholder="Detalhes técnicos, estado dos itens e observações"
                                rows="5"
                                value={lote.descricao_completa}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <button type="submit" className="btn-submit" disabled={isSubmitting || !formValid}>
                            {isSubmitting ? 'Publicando...' : 'Publicar lote'}
                        </button>
                    </form>
                </div>
            </div>

            {mostrarModalSucesso && (
                <div className="sucesso-modal-backdrop">
                    <div className="sucesso-modal-container">
                        <div className="sucesso-modal-icon">✅</div>
                        <h3 className="sucesso-modal-titulo">LOTE CADASTRADO...</h3>
                        <p className="sucesso-modal-texto">LOTE CADASTRADO...</p>
                        <button className="sucesso-modal-btn" onClick={() => { setMostrarModalSucesso(false); navigate('/meus-produtos'); }}>
                            Ir para Meus Produtos
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
