// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDOy0Ylpkkq9GZQLJmmpfkLwCorptjceV4",
    authDomain: "controlemovimentacao-cbd0d.firebaseapp.com",
    projectId: "controlemovimentacao-cbd0d",
    storageBucket: "controlemovimentacao-cbd0d.firebasestorage.app",
    messagingSenderId: "607751879879",
    appId: "1:607751879879:web:0b1bfd6f0beb95b95812e2"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências para os serviços
const db = firebase.firestore();
const storage = firebase.storage();

// Exportar para uso em outros módulos
window.firebaseServices = {
    db,
    storage
};
