// Módulo Paletes
function initializePaletes() {
    console.log("Módulo de Paletes inicializado");
    
    // Configurar eventos
    setupPaletesEvents();
    
    // Atualizar tabela
    updatePaletesTable();
}

function setupPaletesEvents() {
    // Evento para nova movimentação de palete
    document.getElementById('newPaleteBtn').addEventListener('click', showPaleteModal);
    
    // Evento para salvar movimentação de palete
    document.getElementById('savePaleteBtn').addEventListener('click', savePaleteMovement);
}

function showPaleteModal() {
    // Limpar formulário
    document.getElementById('paleteForm').reset();
    document.getElementById('paleteDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('paleteModalTitle').textContent = 'Nova Movimentação de Palete';
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('paleteModal'));
    modal.show();
}

function savePaleteMovement() {
    // Validar formulário
    if (!validatePaleteForm()) return;
    
    // Obter dados do formulário
    const formData = getPaleteFormData();
    
    // Salvar movimentação de palete
    savePaleteToStorage(formData);
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('paleteModal'));
    modal.hide();
    
    // Atualizar tabela
    updatePaletesTable();
    
    alert('Movimentação de palete salva com sucesso!');
}

function validatePaleteForm() {
    const requiredFields = ['paleteDate', 'paleteType', 'paleteMovement', 'paleteQuantity'];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            alert(`O campo ${field.labels[0].textContent} é obrigatório.`);
            field.focus();
            return false;
        }
    }
    
    return true;
}

function getPaleteFormData() {
    return {
        id: Date.now(),
        date: document.getElementById('paleteDate').value,
        tipoPalete: document.getElementById('paleteType').value,
        tipoMovimento: document.getElementById('paleteMovement').value,
        quantidade: parseInt(document.getElementById('paleteQuantity').value),
        timestamp: new Date().toISOString()
    };
}

function savePaleteToStorage(formData) {
    let paletesData = JSON.parse(localStorage.getItem('paletesData') || '[]');
    
    // Gerar número do relatório
    let lastReportNumber = parseInt(localStorage.getItem('lastPaletesReportNumber') || '0');
    const reportNumber = lastReportNumber + 1;
    
    // Adicionar número do relatório aos dados
    formData.reportNumber = reportNumber;
    
    // Salvar dados
    paletesData.push(formData);
    localStorage.setItem('paletesData', JSON.stringify(paletesData));
    localStorage.setItem('lastPaletesReportNumber', reportNumber.toString());
}

function updatePaletesTable() {
    const paletesData = JSON.parse(localStorage.getItem('paletesData') || '[]');
    
    // Agrupar por data
    const groupedByDate = groupPaletesByDate(paletesData);
    
    // Renderizar accordion
    renderPaletesAccordion(groupedByDate);
}

function groupPaletesByDate(paletesData) {
    const grouped = {};
    
    paletesData.forEach(palete => {
        if (!grouped[palete.date]) {
            grouped[palete.date] = [];
        }
        grouped[palete.date].push(palete);
    });
    
    return grouped;
}

function renderPaletesAccordion(groupedPaletes) {
    const accordion = document.getElementById('paletesAccordion');
    accordion.innerHTML = '';
    
    // Ordenar datas (mais recentes primeiro)
    const sortedDates = Object.keys(groupedPaletes).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.forEach((date, index) => {
        const paletes = groupedPaletes[date];
        
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        // Calcular totais
        const entradas = paletes
            .filter(p => p.tipoMovimento === 'Entrada')
            .reduce((sum, p) => sum + p.quantidade, 0);
        
        const saidas = paletes
            .filter(p => p.tipoMovimento === 'Saída')
            .reduce((sum, p) => sum + p.quantidade, 0);
        
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                    data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                    <strong>${window.utils.formatDate(date)}</strong>
                    <span class="badge bg-primary ms-2">Relatório #${paletes[0].reportNumber}</span>
                    <span class="badge bg-success ms-2">Entradas: ${entradas}</span>
                    <span class="badge bg-warning ms-2">Saídas: ${saidas}</span>
                </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}">
                <div class="accordion-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Tipo de Palete</th>
                                    <th>Movimento</th>
                                    <th>Quantidade</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${paletes.map(palete => `
                                    <tr>
                                        <td>${palete.tipoPalete}</td>
                                        <td>
                                            <span class="badge ${palete.tipoMovimento === 'Entrada' ? 'bg-success' : 'bg-warning'}">
                                                ${palete.tipoMovimento}
                                            </span>
                                        </td>
                                        <td>${palete.quantidade}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-warning edit-palete-btn" data-id="${palete.id}">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger delete-palete-btn" data-id="${palete.id}">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        accordion.appendChild(accordionItem);
        
        // Configurar eventos dos botões de ação
        accordionItem.querySelectorAll('.edit-palete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                editPaleteMovement(this.getAttribute('data-id'));
            });
        });
        
        accordionItem.querySelectorAll('.delete-palete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deletePaleteMovement(this.getAttribute('data-id'));
            });
        });
    });
}

function editPaleteMovement(id) {
    alert(`Funcionalidade para editar movimentação de palete ${id} será implementada aqui`);
}

function deletePaleteMovement(id) {
    if (confirm('Tem certeza que deseja excluir esta movimentação de palete?')) {
        let paletesData = JSON.parse(localStorage.getItem('paletesData') || '[]');
        paletesData = paletesData.filter(p => p.id != id);
        localStorage.setItem('paletesData', JSON.stringify(paletesData));
        
        updatePaletesTable();
        alert('Movimentação de palete excluída com sucesso!');
    }
}

// Exportar funções para uso global
window.initializePaletes = initializePaletes;
window.updatePaletesTable = updatePaletesTable;
