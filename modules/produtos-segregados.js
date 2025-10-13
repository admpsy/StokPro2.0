// Módulo Produtos Segregados
function initializeProdutosSegregados() {
    console.log("Módulo de Produtos Segregados inicializado");
    
    // Configurar eventos
    setupSegregatedEvents();
}

function setupSegregatedEvents() {
    // Evento para novo produto segregado
    document.getElementById('newSegregatedBtn').addEventListener('click', showSegregatedModal);
    
    // Evento para salvar produto segregado
    document.getElementById('saveSegregatedBtn').addEventListener('click', saveSegregatedProduct);
    
    // Evento para motivo de segregação
    document.getElementById('segregatedReason').addEventListener('change', function() {
        const otherReasonContainer = document.getElementById('otherReasonContainer');
        if (this.value === 'outros') {
            otherReasonContainer.style.display = 'block';
        } else {
            otherReasonContainer.style.display = 'none';
        }
    });
    
    // Evento para contador de caracteres
    document.getElementById('segregatedObservations').addEventListener('input', function() {
        document.getElementById('charCount').textContent = this.value.length;
    });
    
    // Evento para aplicar filtros
    document.getElementById('applyFiltersBtn').addEventListener('click', updateSegregatedTable);
    
    // Evento para limpar filtros
    document.getElementById('clearFiltersBtn').addEventListener('click', clearSegregatedFilters);
    
    // Evento para preview de fotos
    document.getElementById('segregatedPhotos').addEventListener('change', handleSegregatedPhotoPreview);
}

function showSegregatedModal() {
    // Limpar formulário
    document.getElementById('segregatedForm').reset();
    document.getElementById('segregatedId').value = '';
    document.getElementById('segregatedModalTitle').textContent = 'Novo Produto Segregado';
    document.getElementById('segregatedStartDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('segregatedStatus').value = 'ativo';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('segregatedPhotoPreview').innerHTML = '';
    document.getElementById('otherReasonContainer').style.display = 'none';
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('segregatedModal'));
    modal.show();
}

function saveSegregatedProduct() {
    // Validar formulário
    if (!validateSegregatedForm()) return;
    
    // Obter dados do formulário
    const formData = getSegregatedFormData();
    
    // Salvar produto segregado
    saveSegregatedToStorage(formData);
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('segregatedModal'));
    modal.hide();
    
    // Atualizar tabela
    updateSegregatedTable();
    
    alert('Produto segregado salvo com sucesso!');
}

function validateSegregatedForm() {
    const requiredFields = [
        'segregatedSKU', 'segregatedProduct', 'segregatedType', 
        'segregatedQuantity', 'segregatedBatch', 'segregatedManufacturingDate',
        'segregatedReason', 'segregatedLocation', 'segregatedResponsible',
        'segregatedStartDate', 'segregatedStatus'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            alert(`O campo ${field.labels[0].textContent} é obrigatório.`);
            field.focus();
            return false;
        }
    }
    
    // Validar fotos (mínimo 1)
    const photoInput = document.getElementById('segregatedPhotos');
    if (photoInput.files.length === 0) {
        alert('É obrigatório adicionar pelo menos uma foto.');
        return false;
    }
    
    return true;
}

function getSegregatedFormData() {
    const reason = document.getElementById('segregatedReason').value;
    const otherReason = document.getElementById('segregatedOtherReason').value;
    
    return {
        id: document.getElementById('segregatedId').value || Date.now(),
        SKU: document.getElementById('segregatedSKU').value,
        Produto: document.getElementById('segregatedProduct').value,
        Tipo: document.getElementById('segregatedType').value,
        Quantidade: parseInt(document.getElementById('segregatedQuantity').value),
        Lote: document.getElementById('segregatedBatch').value,
        DataFabricacao: document.getElementById('segregatedManufacturingDate').value,
        MotivoSegregacao: reason === 'outros' ? otherReason : reason,
        Localizacao: document.getElementById('segregatedLocation').value,
        Responsavel: document.getElementById('segregatedResponsible').value,
        StatusSegregacao: document.getElementById('segregatedStatus').value,
        DataInicioSegregacao: document.getElementById('segregatedStartDate').value,
        DataPrevisaoLiberacao: document.getElementById('segregatedExpectedDate').value,
        DataFimSegregacao: document.getElementById('segregatedStatus').value !== 'ativo' ? 
            new Date().toISOString().split('T')[0] : '',
        Observacoes: document.getElementById('segregatedObservations').value,
        Fotos: [], // Serão processadas separadamente
        Documentos: [],
        Historico: [],
        DataCriacao: document.getElementById('segregatedId').value ? 
            '' : new Date().toISOString().split('T')[0],
        UsuarioCriacao: 'Usuário Atual',
        DataUltimaAtualizacao: new Date().toISOString().split('T')[0],
        UsuarioUltimaAtualizacao: 'Usuário Atual'
    };
}

function saveSegregatedToStorage(formData) {
    let segregatedProducts = JSON.parse(localStorage.getItem('segregatedProducts') || '[]');
    
    if (formData.id && document.getElementById('segregatedId').value) {
        // Atualizar produto existente
        const index = segregatedProducts.findIndex(p => p.id == formData.id);
        if (index !== -1) {
            segregatedProducts[index] = formData;
        }
    } else {
        // Adicionar novo produto
        formData.id = Date.now();
        segregatedProducts.push(formData);
    }
    
    localStorage.setItem('segregatedProducts', JSON.stringify(segregatedProducts));
}

function handleSegregatedPhotoPreview(event) {
    const previewContainer = document.getElementById('segregatedPhotoPreview');
    previewContainer.innerHTML = '';
    
    const files = event.target.files;
    
    for (let i = 0; i < files.length && i < 5; i++) {
        const file = files[i];
        
        if (!file.type.match('image.*')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            continue;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const preview = document.createElement('div');
            preview.className = 'photo-preview';
            
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="remove-photo" data-index="${i}">
                    <i class="bi bi-x"></i>
                </div>
            `;
            
            previewContainer.appendChild(preview);
            
            // Configurar evento de remoção
            preview.querySelector('.remove-photo').addEventListener('click', function() {
                preview.remove();
                // Remover arquivo do input (implementação simplificada)
            });
        };
        
        reader.readAsDataURL(file);
    }
}

function updateSegregatedTable() {
    const segregatedProducts = JSON.parse(localStorage.getItem('segregatedProducts') || '[]');
    
    // Aplicar filtros
    const filteredProducts = applySegregatedFilters(segregatedProducts);
    
    // Renderizar tabela
    renderSegregatedTable(filteredProducts);
}

function applySegregatedFilters(products) {
    const statusFilter = document.getElementById('filterStatus').value;
    const reasonFilter = document.getElementById('filterReason').value;
    const responsibleFilter = document.getElementById('filterResponsible').value.toLowerCase();
    const dateFilter = document.getElementById('filterDate').value;
    
    return products.filter(product => {
        // Filtro por status
        if (statusFilter && product.StatusSegregacao !== statusFilter) {
            return false;
        }
        
        // Filtro por motivo
        if (reasonFilter && product.MotivoSegregacao !== reasonFilter) {
            return false;
        }
        
        // Filtro por responsável
        if (responsibleFilter && !product.Responsavel.toLowerCase().includes(responsibleFilter)) {
            return false;
        }
        
        // Filtro por data
        if (dateFilter && product.DataInicioSegregacao !== dateFilter) {
            return false;
        }
        
        return true;
    });
}

function clearSegregatedFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterReason').value = '';
    document.getElementById('filterResponsible').value = '';
    document.getElementById('filterDate').value = '';
    
    updateSegregatedTable();
}

function renderSegregatedTable(products) {
    const tableBody = document.getElementById('segregatedTable');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Determinar badge de status
        let statusBadge = '';
        if (product.StatusSegregacao === 'ativo') {
            statusBadge = '<span class="badge badge-status-ativo">Ativo</span>';
        } else if (product.StatusSegregacao === 'liberado') {
            statusBadge = '<span class="badge badge-status-liberado">Liberado</span>';
        } else if (product.StatusSegregacao === 'descartado') {
            statusBadge = '<span class="badge badge-status-descartado">Descartado</span>';
        }
        
        row.innerHTML = `
            <td>${statusBadge}</td>
            <td>${product.SKU}</td>
            <td>${product.Produto}</td>
            <td>${product.Lote}</td>
            <td>${product.Quantidade}</td>
            <td>${product.MotivoSegregacao}</td>
            <td>${product.Localizacao}</td>
            <td>${product.Responsavel}</td>
            <td>${window.utils.formatDate(product.DataInicioSegregacao)}</td>
            <td>${window.utils.formatDate(product.DataPrevisaoLiberacao)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-segregated-btn" data-id="${product.id}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning edit-segregated-btn" data-id="${product.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-segregated-btn" data-id="${product.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Configurar eventos dos botões de ação
        row.querySelector('.view-segregated-btn').addEventListener('click', function() {
            viewSegregatedProduct(product.id);
        });
        
        row.querySelector('.edit-segregated-btn').addEventListener('click', function() {
            editSegregatedProduct(product.id);
        });
        
        row.querySelector('.delete-segregated-btn').addEventListener('click', function() {
            deleteSegregatedProduct(product.id);
        });
    });
}

function viewSegregatedProduct(id) {
    alert(`Funcionalidade para visualizar produto segregado ${id} será implementada aqui`);
}

function editSegregatedProduct(id) {
    const segregatedProducts = JSON.parse(localStorage.getItem('segregatedProducts') || '[]');
    const product = segregatedProducts.find(p => p.id == id);
    
    if (product) {
        // Preencher formulário com dados do produto
        document.getElementById('segregatedId').value = product.id;
        document.getElementById('segregatedSKU').value = product.SKU;
        document.getElementById('segregatedProduct').value = product.Produto;
        document.getElementById('segregatedType').value = product.Tipo;
        document.getElementById('segregatedQuantity').value = product.Quantidade;
        document.getElementById('segregatedBatch').value = product.Lote;
        document.getElementById('segregatedManufacturingDate').value = product.DataFabricacao;
        document.getElementById('segregatedReason').value = product.MotivoSegregacao;
        document.getElementById('segregatedLocation').value = product.Localizacao;
        document.getElementById('segregatedResponsible').value = product.Responsavel;
        document.getElementById('segregatedStatus').value = product.StatusSegregacao;
        document.getElementById('segregatedStartDate').value = product.DataInicioSegregacao;
        document.getElementById('segregatedExpectedDate').value = product.DataPrevisaoLiberacao;
        document.getElementById('segregatedObservations').value = product.Observacoes || '';
        document.getElementById('charCount').textContent = (product.Observacoes || '').length;
        
        // Mostrar modal
        document.getElementById('segregatedModalTitle').textContent = 'Editar Produto Segregado';
        const modal = new bootstrap.Modal(document.getElementById('segregatedModal'));
        modal.show();
    }
}

function deleteSegregatedProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto segregado?')) {
        let segregatedProducts = JSON.parse(localStorage.getItem('segregatedProducts') || '[]');
        segregatedProducts = segregatedProducts.filter(p => p.id != id);
        localStorage.setItem('segregatedProducts', JSON.stringify(segregatedProducts));
        
        updateSegregatedTable();
        alert('Produto segregado excluído com sucesso!');
    }
}

// Exportar funções para uso global
window.initializeProdutosSegregados = initializeProdutosSegregados;
window.updateSegregatedTable = updateSegregatedTable;
