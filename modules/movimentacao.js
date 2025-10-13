// Módulo Movimentação
function initializeMovimentacao() {
    console.log("Módulo de Movimentação inicializado");
    
    // Configurar eventos
    setupMovementEvents();
    
    // Carregar produtos para autocomplete
    loadProductsForAutocomplete();
}

function setupMovementEvents() {
    // Evento para pesquisa de produto
    document.getElementById('productSearch').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const products = JSON.parse(localStorage.getItem('productsData') || '[]');
        
        const matchingProduct = products.find(p => 
            p.SKU.toLowerCase().includes(searchTerm) || 
            p.Produto.toLowerCase().includes(searchTerm)
        );
        
        if (matchingProduct) {
            fillProductDetails(matchingProduct);
        }
    });
    
    // Evento para tipo de movimento
    document.getElementById('movementType').addEventListener('change', function() {
        updateAvailableQuantity();
        updateBatchOptions();
    });
    
    // Evento para adicionar item
    document.getElementById('addItemBtn').addEventListener('click', addItemToTable);
    
    // Evento para salvar movimentação
    document.getElementById('saveMovementBtn').addEventListener('click', saveMovement);
    
    // Evento para gerar relatório
    document.getElementById('generateReportBtn').addEventListener('click', generatePDFReport);
    
    // Evento para preview de fotos
    document.getElementById('photos').addEventListener('change', handlePhotoPreview);
}

function loadProductsForAutocomplete() {
    const products = JSON.parse(localStorage.getItem('productsData') || '[]');
    const productList = document.getElementById('productList');
    
    productList.innerHTML = '';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = `${product.SKU} - ${product.Produto}`;
        productList.appendChild(option);
    });
}

function fillProductDetails(product) {
    document.getElementById('productSKU').value = product.SKU;
    document.getElementById('productName').value = product.Produto;
    document.getElementById('productType').value = product.Tipo;
    
    updateAvailableQuantity();
    updateBatchOptions();
}

function updateAvailableQuantity() {
    const sku = document.getElementById('productSKU').value;
    const movementType = document.getElementById('movementType').value;
    const products = JSON.parse(localStorage.getItem('productsData') || '[]');
    
    const product = products.find(p => p.SKU === sku);
    
    if (product) {
        if (movementType === 'Saída') {
            document.getElementById('availableQuantity').value = product.Quantidade;
        } else {
            document.getElementById('availableQuantity').value = '-';
        }
    } else {
        document.getElementById('availableQuantity').value = '0';
    }
}

function updateBatchOptions() {
    const sku = document.getElementById('productSKU').value;
    const movementType = document.getElementById('movementType').value;
    const products = JSON.parse(localStorage.getItem('productsData') || '[]');
    const batchSelect = document.getElementById('batch');
    
    batchSelect.innerHTML = '<option value="">Selecione...</option>';
    
    if (sku) {
        const productBatches = products.filter(p => p.SKU === sku);
        
        productBatches.forEach(product => {
            const option = document.createElement('option');
            option.value = product.Lote;
            option.textContent = product.Lote;
            batchSelect.appendChild(option);
        });
        
        // Para entradas, permitir criar novo lote
        if (movementType === 'Entrada') {
            const newOption = document.createElement('option');
            newOption.value = 'new';
            newOption.textContent = '[Novo Lote]';
            batchSelect.appendChild(newOption);
        }
    }
}

function addItemToTable() {
    // Validar formulário
    if (!validateMovementForm()) return;
    
    // Obter dados do formulário
    const formData = getMovementFormData();
    
    // Adicionar à tabela
    addItemToTableUI(formData);
    
    // Limpar formulário
    clearMovementForm();
    
    // Atualizar contador
    updateItemsCounter();
}

function validateMovementForm() {
    const requiredFields = [
        'movementDate', 'movementType', 'productSKU', 
        'batch', 'manufacturingDate', 'quantity'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            alert(`O campo ${field.labels[0].textContent} é obrigatório.`);
            field.focus();
            return false;
        }
    }
    
    // Validar quantidade para saída
    const movementType = document.getElementById('movementType').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const availableQuantity = parseInt(document.getElementById('availableQuantity').value) || 0;
    
    if (movementType === 'Saída' && quantity > availableQuantity) {
        alert(`Quantidade insuficiente em estoque. Disponível: ${availableQuantity}`);
        return false;
    }
    
    return true;
}

function getMovementFormData() {
    return {
        date: document.getElementById('movementDate').value,
        movementType: document.getElementById('movementType').value,
        productSKU: document.getElementById('productSKU').value,
        productName: document.getElementById('productName').value,
        productType: document.getElementById('productType').value,
        batch: document.getElementById('batch').value,
        manufacturingDate: document.getElementById('manufacturingDate').value,
        quantity: parseInt(document.getElementById('quantity').value),
        availableQuantity: document.getElementById('availableQuantity').value
    };
}

function addItemToTableUI(itemData) {
    const tableBody = document.getElementById('itemsTable');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${itemData.productName}</td>
        <td>${itemData.batch}</td>
        <td>${itemData.quantity}</td>
        <td>${itemData.movementType}</td>
        <td>
            <button class="btn btn-sm btn-outline-danger remove-item">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    // Adicionar dados como atributo para referência
    row.setAttribute('data-item', JSON.stringify(itemData));
    
    tableBody.appendChild(row);
    
    // Configurar evento de remoção
    row.querySelector('.remove-item').addEventListener('click', function() {
        row.remove();
        updateItemsCounter();
    });
}

function clearMovementForm() {
    document.getElementById('productSearch').value = '';
    document.getElementById('productSKU').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productType').value = '';
    document.getElementById('availableQuantity').value = '';
    document.getElementById('batch').value = '';
    document.getElementById('manufacturingDate').value = '';
    document.getElementById('quantity').value = '';
}

function updateItemsCounter() {
    const itemCount = document.getElementById('itemsTable').children.length;
    document.getElementById('totalItems').textContent = itemCount;
}

function handlePhotoPreview(event) {
    const previewContainer = document.getElementById('photoPreview');
    previewContainer.innerHTML = '';
    
    const files = event.target.files;
    
    for (let i = 0; i < files.length; i++) {
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

function saveMovement() {
    const itemsTable = document.getElementById('itemsTable');
    
    if (itemsTable.children.length === 0) {
        alert('Adicione pelo menos um item antes de salvar.');
        return;
    }
    
    // Coletar todos os itens da tabela
    const items = [];
    const rows = itemsTable.querySelectorAll('tr');
    
    rows.forEach(row => {
        const itemData = JSON.parse(row.getAttribute('data-item'));
        items.push(itemData);
    });
    
    // Processar movimentação
    processMovement(items);
    
    // Limpar tabela
    itemsTable.innerHTML = '';
    updateItemsCounter();
    
    // Limpar preview de fotos
    document.getElementById('photoPreview').innerHTML = '';
    document.getElementById('photos').value = '';
    
    alert('Movimentação salva com sucesso!');
    
    // Atualizar dashboard
    updateDashboard();
    
    // Atualizar estoque
    updateStockTable();
}

function processMovement(items) {
    // Obter dados existentes
    let movements = JSON.parse(localStorage.getItem('movementHistory') || '[]');
    let products = JSON.parse(localStorage.getItem('productsData') || '[]');
    let lastReportNumber = parseInt(localStorage.getItem('lastReportNumber') || '0');
    
    // Gerar número do relatório
    const reportNumber = lastReportNumber + 1;
    
    // Processar cada item
    items.forEach(item => {
        // Criar registro de movimentação
        const movement = {
            id: movements.length + 1,
            timestamp: new Date().toISOString(),
            date: item.date,
            movementType: item.movementType,
            productSKU: item.productSKU,
            productName: item.productName,
            quantity: item.quantity,
            productType: item.productType,
            batch: item.batch,
            manufacturingDate: item.manufacturingDate,
            reportNumber: reportNumber
        };
        
        movements.push(movement);
        
        // Atualizar estoque
        if (item.movementType === 'Entrada') {
            // Para entrada, adicionar ao estoque
            const existingProduct = products.find(p => 
                p.SKU === item.productSKU && p.Lote === item.batch
            );
            
            if (existingProduct) {
                // Atualizar produto existente
                existingProduct.Quantidade += item.quantity;
                existingProduct.Entradas += item.quantity;
            } else {
                // Criar novo produto
                const newProduct = {
                    SKU: item.productSKU,
                    Produto: item.productName,
                    Tipo: item.productType,
                    Quantidade: item.quantity,
                    Lote: item.batch,
                    "Data Fabricação": item.manufacturingDate,
                    Entradas: item.quantity,
                    Saídas: 0,
                    id: products.length + 1
                };
                
                products.push(newProduct);
            }
        } else if (item.movementType === 'Saída') {
            // Para saída, aplicar FIFO
            const result = processarSaidaFIFO(item.productSKU, item.quantity, products);
            
            if (result.remainingQuantity > 0) {
                alert(`Atenção: Apenas ${item.quantity - result.remainingQuantity} unidades foram processadas. Quantidade insuficiente em estoque.`);
            }
            
            movement.quantidadeProcessada = item.quantity - result.remainingQuantity;
            movement.remainingQuantity = result.remainingQuantity;
            movement.lotesUtilizados = result.lotesUtilizados;
        }
    });
    
    // Criar relatório
    const report = {
        reportNumber: reportNumber,
        date: items[0].date,
        timestamp: new Date().toISOString(),
        items: movements.filter(m => m.reportNumber === reportNumber)
    };
    
    // Salvar dados atualizados
    localStorage.setItem('movementHistory', JSON.stringify(movements));
    localStorage.setItem('productsData', JSON.stringify(products));
    localStorage.setItem('lastReportNumber', reportNumber.toString());
    
    // Adicionar relatório ao histórico
    let reports = JSON.parse(localStorage.getItem('reportsHistory') || '[]');
    reports.push(report);
    localStorage.setItem('reportsHistory', JSON.stringify(reports));
    
    return report;
}

function processarSaidaFIFO(productSKU, quantidadeRequerida, products) {
    // Filtrar produtos pelo SKU e ordenar por data de fabricação (mais antigos primeiro)
    const produtosOrdenados = products
        .filter(p => p.SKU === productSKU && p.Quantidade > 0)
        .sort((a, b) => new Date(a['Data Fabricação']) - new Date(b['Data Fabricação']));
    
    let quantidadeRestante = quantidadeRequerida;
    const lotesUtilizados = [];
    
    for (let produto of produtosOrdenados) {
        if (quantidadeRestante <= 0) break;
        
        const quantidadeDisponivel = produto.Quantidade;
        const quantidadeUsar = Math.min(quantidadeRestante, quantidadeDisponivel);
        
        lotesUtilizados.push({
            lote: produto.Lote,
            quantidade: quantidadeUsar,
            disponivelAntes: quantidadeDisponivel
        });
        
        produto.Quantidade -= quantidadeUsar;
        produto.Saídas += quantidadeUsar;
        quantidadeRestante -= quantidadeUsar;
    }
    
    return {
        quantidadeProcessada: quantidadeRequerida - quantidadeRestante,
        lotesUtilizados: lotesUtilizados,
        remainingQuantity: quantidadeRestante
    };
}

function generatePDFReport() {
    // Implementação simplificada - em um sistema real, isso geraria um PDF
    alert('Funcionalidade de geração de PDF será implementada aqui');
}

// Exportar funções para uso global
window.initializeMovimentacao = initializeMovimentacao;
window.processarSaidaFIFO = processarSaidaFIFO;
