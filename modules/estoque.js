// Módulo Estoque
function initializeEstoque() {
    console.log("Módulo de Estoque inicializado");
    
    // Configurar eventos
    setupStockEvents();
}

function setupStockEvents() {
    // Evento para busca
    document.getElementById('filterStockBtn').addEventListener('click', updateStockTable);
    
    // Evento para pressionar Enter na busca
    document.getElementById('searchStock').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateStockTable();
        }
    });
}

function updateStockTable() {
    const products = JSON.parse(localStorage.getItem('productsData') || '[]');
    const searchTerm = document.getElementById('searchStock').value.toLowerCase();
    
    // Agrupar produtos por SKU
    const groupedProducts = groupProductsBySKU(products);
    
    // Aplicar filtro se houver termo de busca
    const filteredProducts = searchTerm ? 
        groupedProducts.filter(p => 
            p.SKU.toLowerCase().includes(searchTerm) || 
            p.Produto.toLowerCase().includes(searchTerm)
        ) : 
        groupedProducts;
    
    // Atualizar tabela
    renderStockTable(filteredProducts);
}

function groupProductsBySKU(products) {
    const grouped = {};
    
    products.forEach(product => {
        if (!grouped[product.SKU]) {
            grouped[product.SKU] = {
                SKU: product.SKU,
                Produto: product.Produto,
                Tipo: product.Tipo,
                QuantidadeTotal: 0,
                Lotes: [],
                expanded: false
            };
        }
        
        grouped[product.SKU].QuantidadeTotal += product.Quantidade;
        grouped[product.SKU].Lotes.push({
            Lote: product.Lote,
            Quantidade: product.Quantidade,
            "Data Fabricação": product["Data Fabricação"],
            Entradas: product.Entradas,
            Saídas: product.Saídas
        });
    });
    
    return Object.values(grouped);
}

function renderStockTable(groupedProducts) {
    const tableBody = document.getElementById('stockTable');
    tableBody.innerHTML = '';
    
    groupedProducts.forEach(group => {
        // Linha principal (agrupada)
        const mainRow = document.createElement('tr');
        mainRow.className = 'stock-group';
        
        mainRow.innerHTML = `
            <td>
                <button class="btn btn-sm btn-outline-primary expand-btn" data-sku="${group.SKU}">
                    <i class="bi bi-chevron-right"></i>
                </button>
            </td>
            <td>${group.SKU}</td>
            <td>${group.Produto}</td>
            <td>${group.Tipo}</td>
            <td>${group.QuantidadeTotal}</td>
            <td>${group.Lotes.length}</td>
            <td>
                <button class="btn btn-sm btn-outline-success add-batch-btn" data-sku="${group.SKU}">
                    <i class="bi bi-plus-circle"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(mainRow);
        
        // Configurar evento de expansão
        mainRow.querySelector('.expand-btn').addEventListener('click', function() {
            toggleBatchDetails(group.SKU, this);
        });
        
        // Configurar evento de adicionar lote
        mainRow.querySelector('.add-batch-btn').addEventListener('click', function() {
            addNewBatch(group.SKU);
        });
        
        // Linhas de detalhes (inicialmente ocultas)
        group.Lotes.forEach(lote => {
            const vencimento = window.utils.calcularVencimento(lote["Data Fabricação"]);
            const status = window.utils.verificarStatusProduto(vencimento);
            
            const detailRow = document.createElement('tr');
            detailRow.className = `batch-detail ${group.SKU}-detail d-none`;
            
            detailRow.innerHTML = `
                <td></td>
                <td colspan="2">
                    <strong>Lote:</strong> ${lote.Lote}
                </td>
                <td>
                    <strong>Quantidade:</strong> ${lote.Quantidade}
                </td>
                <td>
                    <strong>Fabricação:</strong> ${window.utils.formatDate(lote["Data Fabricação"])}
                </td>
                <td>
                    <span class="${status.class}">${status.status}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-warning edit-batch-btn" data-lote="${lote.Lote}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-batch-btn" data-lote="${lote.Lote}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(detailRow);
            
            // Configurar eventos dos botões de ação
            detailRow.querySelector('.edit-batch-btn').addEventListener('click', function() {
                editBatch(lote.Lote);
            });
            
            detailRow.querySelector('.delete-batch-btn').addEventListener('click', function() {
                deleteBatch(lote.Lote);
            });
        });
    });
}

function toggleBatchDetails(sku, button) {
    const details = document.querySelectorAll(`.${sku}-detail`);
    const icon = button.querySelector('i');
    
    if (details[0].classList.contains('d-none')) {
        // Expandir
        details.forEach(detail => detail.classList.remove('d-none'));
        icon.className = 'bi bi-chevron-down';
    } else {
        // Recolher
        details.forEach(detail => detail.classList.add('d-none'));
        icon.className = 'bi bi-chevron-right';
    }
}

function addNewBatch(sku) {
    alert(`Funcionalidade para adicionar novo lote ao produto ${sku} será implementada aqui`);
}

function editBatch(lote) {
    alert(`Funcionalidade para editar lote ${lote} será implementada aqui`);
}

function deleteBatch(lote) {
    if (confirm(`Tem certeza que deseja excluir o lote ${lote}?`)) {
        // Implementar exclusão do lote
        alert(`Lote ${lote} excluído com sucesso`);
        updateStockTable();
    }
}

// Exportar funções para uso global
window.initializeEstoque = initializeEstoque;
window.updateStockTable = updateStockTable;
