// Módulo Relatórios
function initializeRelatorios() {
    console.log("Módulo de Relatórios inicializado");
    
    // Configurar eventos
    setupReportsEvents();
    
    // Atualizar tabela
    updateReportsTable();
}

function setupReportsEvents() {
    // Evento para filtrar relatórios
    document.getElementById('filterReportsBtn').addEventListener('click', updateReportsTable);
    
    // Evento para exportar relatórios
    document.getElementById('exportReportsBtn').addEventListener('click', exportReports);
}

function updateReportsTable() {
    const reports = JSON.parse(localStorage.getItem('reportsHistory') || '[]');
    const dateFilter = document.getElementById('reportDateFilter').value;
    
    // Aplicar filtro de data se especificado
    const filteredReports = dateFilter ? 
        reports.filter(r => r.date === dateFilter) : 
        reports;
    
    // Ordenar por data (mais recentes primeiro)
    filteredReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Renderizar tabela
    renderReportsTable(filteredReports);
}

function renderReportsTable(reports) {
    const tableBody = document.getElementById('reportsTable');
    tableBody.innerHTML = '';
    
    reports.forEach(report => {
        const row = document.createElement('tr');
        
        // Calcular totais
        const entradas = report.items
            .filter(item => item.movementType === 'Entrada')
            .reduce((sum, item) => sum + item.quantity, 0);
        
        const saidas = report.items
            .filter(item => item.movementType === 'Saída')
            .reduce((sum, item) => sum + item.quantity, 0);
        
        row.innerHTML = `
            <td>#${report.reportNumber}</td>
            <td>${window.utils.formatDate(report.date)}</td>
            <td>${report.items.length} itens</td>
            <td>
                <span class="badge bg-success">Entradas: ${entradas}</span>
                <span class="badge bg-warning">Saídas: ${saidas}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-report-btn" data-id="${report.reportNumber}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success pdf-report-btn" data-id="${report.reportNumber}">
                    <i class="bi bi-file-earmark-pdf"></i>
                </button>
                <button class="btn btn-sm btn-outline-info excel-report-btn" data-id="${report.reportNumber}">
                    <i class="bi bi-file-earmark-excel"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Configurar eventos dos botões de ação
        row.querySelector('.view-report-btn').addEventListener('click', function() {
            viewReport(this.getAttribute('data-id'));
        });
        
        row.querySelector('.pdf-report-btn').addEventListener('click', function() {
            generatePDFReport(this.getAttribute('data-id'));
        });
        
        row.querySelector('.excel-report-btn').addEventListener('click', function() {
            generateExcelReport(this.getAttribute('data-id'));
        });
    });
}

function viewReport(reportNumber) {
    const reports = JSON.parse(localStorage.getItem('reportsHistory') || '[]');
    const report = reports.find(r => r.reportNumber == reportNumber);
    
    if (report) {
        // Criar modal para visualização do relatório
        const modalContent = `
            <div class="modal-header">
                <h5 class="modal-title">Relatório #${report.reportNumber} - ${window.utils.formatDate(report.date)}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Lote</th>
                                <th>Movimento</th>
                                <th>Quantidade</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.items.map(item => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td>${item.batch}</td>
                                    <td>
                                        <span class="badge ${item.movementType === 'Entrada' ? 'bg-success' : 'bg-warning'}">
                                            ${item.movementType}
                                        </span>
                                    </td>
                                    <td>${item.quantity}</td>
                                    <td>${item.productType}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            </div>
        `;
        
        // Criar modal dinamicamente
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal fade';
        modalContainer.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    ${modalContent}
                </div>
            </div>
        `;
        
        document.body.appendChild(modalContainer);
        
        const modal = new bootstrap.Modal(modalContainer);
        modal.show();
        
        // Remover modal do DOM após fechar
        modalContainer.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modalContainer);
        });
    }
}

function generatePDFReport(reportNumber) {
    alert(`Funcionalidade para gerar PDF do relatório ${reportNumber} será implementada aqui`);
}

function generateExcelReport(reportNumber) {
    alert(`Funcionalidade para gerar Excel do relatório ${reportNumber} será implementada aqui`);
}

function exportReports() {
    alert('Funcionalidade para exportar todos os relatórios será implementada aqui');
}

// Exportar funções para uso global
window.initializeRelatorios = initializeRelatorios;
window.updateReportsTable = updateReportsTable;
