// Módulo Dashboard
function initializeDashboard() {
    console.log("Dashboard inicializado");
}

function updateDashboard() {
    // Obter dados do localStorage
    const products = JSON.parse(localStorage.getItem('productsData') || '[]');
    const movements = JSON.parse(localStorage.getItem('movementHistory') || '[]');
    const segregated = JSON.parse(localStorage.getItem('segregatedProducts') || '[]');
    
    // Calcular estatísticas
    const totalProdutos = products.reduce((sum, product) => sum + product.Quantidade, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const entradasDia = movements
        .filter(m => m.date === today && m.movementType === 'Entrada')
        .reduce((sum, m) => sum + m.quantity, 0);
    
    const saidasDia = movements
        .filter(m => m.date === today && m.movementType === 'Saída')
        .reduce((sum, m) => sum + m.quantity, 0);
    
    const alertasAtivos = segregated.filter(p => p.StatusSegregacao === 'ativo').length;
    
    // Atualizar cards
    document.getElementById('totalProdutos').textContent = totalProdutos;
    document.getElementById('entradasDia').textContent = entradasDia;
    document.getElementById('saidasDia').textContent = saidasDia;
    document.getElementById('alertasAtivos').textContent = alertasAtivos;
    
    // Atualizar tabela de movimentações recentes
    updateRecentMovementsTable(movements);
    
    // Atualizar tabela de status de produtos
    updateProductStatusTable(products);
    
    // Atualizar tabela de produtos com vencimento próximo
    updateExpiringProductsTable(products);
}

function updateRecentMovementsTable(movements) {
    const tableBody = document.getElementById('recentMovementsTable');
    tableBody.innerHTML = '';
    
    // Ordenar por data (mais recentes primeiro) e pegar os 5 primeiros
    const recentMovements = movements
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
    
    recentMovements.forEach(movement => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${window.utils.formatDate(movement.date)}</td>
            <td>${movement.productName}</td>
            <td>${movement.movementType}</td>
            <td>${movement.quantity}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateProductStatusTable(products) {
    const tableBody = document.getElementById('productStatusTable');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const vencimento = window.utils.calcularVencimento(product['Data Fabricação']);
        const status = window.utils.verificarStatusProduto(vencimento);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.Produto}</td>
            <td>${product.Lote}</td>
            <td><span class="${status.class}">${status.status}</span></td>
            <td>${window.utils.formatDate(vencimento)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateExpiringProductsTable(products) {
    const tableBody = document.getElementById('expiringProductsTable');
    tableBody.innerHTML = '';
    
    const today = new Date();
    const warningThreshold = new Date();
    warningThreshold.setFullYear(warningThreshold.getFullYear() - 3); // 1 ano antes do vencimento
    
    const expiringProducts = products.filter(product => {
        const vencimento = new Date(window.utils.calcularVencimento(product['Data Fabricação']));
        return vencimento <= warningThreshold;
    });
    
    expiringProducts.forEach(product => {
        const vencimento = window.utils.calcularVencimento(product['Data Fabricação']);
        const status = window.utils.verificarStatusProduto(vencimento);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.Produto}</td>
            <td>${product.Lote}</td>
            <td>${product.Quantidade}</td>
            <td>${window.utils.formatDate(product['Data Fabricação'])}</td>
            <td>${window.utils.formatDate(vencimento)}</td>
            <td><span class="${status.class}">${status.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// Exportar funções para uso global
window.initializeDashboard = initializeDashboard;
window.updateDashboard = updateDashboard;
