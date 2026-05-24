// Referências do DOM
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const productForm = document.getElementById('productForm');
const productsTableBody = document.getElementById('productsTableBody');
const toastMsg = document.getElementById('toastMsg');
const formTitle = document.getElementById('formTitle');

// Verifica se já está logado ao abrir a página
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showAdminPanel();
  } else {
    showLoginScreen();
  }
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showToast('Erro ao logar: ' + error.message);
  } else {
    showAdminPanel();
  }
});

// Logout
async function logout() {
  await supabase.auth.signOut();
  showLoginScreen();
}

// Controles de Tela
function showLoginScreen() {
  loginScreen.style.display = 'flex';
  adminPanel.style.display = 'none';
}

function showAdminPanel() {
  loginScreen.style.display = 'none';
  adminPanel.style.display = 'flex';
  loadProducts();
}

// Mostrar mensagens (Toast)
function showToast(msg) {
  toastMsg.innerText = msg;
  toastMsg.style.display = 'block';
  setTimeout(() => {
    toastMsg.style.display = 'none';
  }, 3000);
}

// ----- CRUD DE PRODUTOS -----

// Carregar Produtos
async function loadProducts() {
  const { data: produtos, error } = await supabase
    .from('produtos')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    showToast('Erro ao carregar produtos');
    return;
  }

  productsTableBody.innerHTML = '';
  produtos.forEach(prod => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${prod.image_url}" class="prod-img-preview"></td>
      <td>${prod.name}</td>
      <td>R$ ${parseFloat(prod.price).toFixed(2)}</td>
      <td>${prod.category}</td>
      <td class="actions-btn">
        <button class="btn-edit" onclick="editProduct(${prod.id})">Editar</button>
        <button class="btn-del" onclick="deleteProduct(${prod.id})">Excluir</button>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });
}

// Salvar Produto (Criar ou Editar)
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('prodId').value;
  const name = document.getElementById('prodName').value;
  const price = document.getElementById('prodPrice').value;
  const category = document.getElementById('prodCat').value;
  const badge = document.getElementById('prodBadge').value;
  const description = document.getElementById('prodDesc').value;
  const imgFile = document.getElementById('prodImg').files[0];
  
  document.getElementById('saveBtn').innerText = 'Salvando...';
  
  let imageUrl = '';

  // Fazer upload da imagem se tiver selecionado uma nova
  if (imgFile) {
    const fileExt = imgFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagens_produtos')
      .upload(filePath, imgFile);

    if (uploadError) {
      showToast('Erro ao fazer upload da imagem.');
      document.getElementById('saveBtn').innerText = 'Salvar Produto';
      return;
    }

    const { data } = supabase.storage.from('imagens_produtos').getPublicUrl(filePath);
    imageUrl = data.publicUrl;
  }

  // Prepara os dados
  const productData = {
    name,
    price: parseFloat(price),
    category,
    badge,
    description
  };
  
  if (imageUrl) {
    productData.image_url = imageUrl;
  }

  if (id) {
    // Editar
    const { error } = await supabase.from('produtos').update(productData).eq('id', id);
    if (error) showToast('Erro ao atualizar!');
    else showToast('Produto atualizado com sucesso!');
  } else {
    // Criar novo
    // Se não selecionou imagem no novo, usa um placeholder (opcional)
    if(!imageUrl) productData.image_url = 'img/p1.jpg'; // fallback para teste se a pessoa esquecer
    
    const { error } = await supabase.from('produtos').insert([productData]);
    if (error) showToast('Erro ao criar!');
    else showToast('Produto criado com sucesso!');
  }

  resetForm();
  loadProducts();
});

// Editar
window.editProduct = async (id) => {
  const { data, error } = await supabase.from('produtos').select('*').eq('id', id).single();
  if (data) {
    formTitle.innerText = 'Editar Produto';
    document.getElementById('prodId').value = data.id;
    document.getElementById('prodName').value = data.name;
    document.getElementById('prodPrice').value = data.price;
    document.getElementById('prodCat').value = data.category;
    document.getElementById('prodBadge').value = data.badge || '';
    document.getElementById('prodDesc').value = data.description;
    window.scrollTo(0,0);
  }
};

// Excluir
window.deleteProduct = async (id) => {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) {
      showToast('Erro ao excluir');
    } else {
      showToast('Produto excluído');
      loadProducts();
    }
  }
};

// Limpar Formulário
function resetForm() {
  productForm.reset();
  document.getElementById('prodId').value = '';
  formTitle.innerText = 'Novo Produto';
  document.getElementById('saveBtn').innerText = 'Salvar Produto';
}

// Inicia
checkAuth();
