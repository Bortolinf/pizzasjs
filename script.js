let cart = [];
let modalQt = 1;
let modalKey = 0; // armazena a chave da pizza selecionada no modal

//atalho p/facilitar o uso do queryselector
const c = (el)=> document.querySelector(el);
const cs = (el)=> document.querySelectorAll(el);

// listagem das pizzas
pizzaJson.map((item, index)=>{
    //vamos criar um clone da class .pizza-item do html
    let pizzaItem = c('.models .pizza-item').cloneNode(true);

    //cria um atributo com o código da pizza
    pizzaItem.setAttribute('data-key', index);

    //preenche as informações do pizzaItem
    pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
    pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;
    pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price.toFixed(2)}` ;
    pizzaItem.querySelector('.pizza-item--img img' ).src = item.img;

    // incluindo a acao que abre o modal ao clicar na pizza
    pizzaItem.querySelector('a').addEventListener('click', (e)=> {
        e.preventDefault(); //previne acao default de remontar a pagina
        let key = e.target.closest('.pizza-item').getAttribute('data-key'); //vai procurar o item mais proximo da classe 'pizza-item' e pegar o atributo data-key

        // preenchendo os dados do modal
        c('.pizzaInfo h1').innerHTML = item.name;
        c('.pizzaInfo--desc').innerHTML = item.description;
        c('.pizzaInfo--actualPrice').innerHTML = `R$ ${item.price.toFixed(2)}`;
        c('.pizzaBig img' ).src = item.img;
        //removendo a classe selected dos tamanhos de pizza
        c('.pizzaInfo--size.selected').classList.remove('selected');
        // aqui estou gerando uma lista dos 3 pizzaInfo-size
        cs('.pizzaInfo--size').forEach((size, indexSize)=> {
            size.querySelector('span').innerHTML = item.sizes[indexSize];
            // tamanho grande - assumir como selecionado
            if (indexSize == 2){
                size.classList.add('selected');
            }
        });
        // salva a key da pizza
        modalKey = key;
        // inicializamos a quantidade com 1
        modalQt = 1;
        c('.pizzaInfo--qt').innerHTML = modalQt;

        // efeito de abertura do modal
        c('.pizzaWindowArea').style.opacity = 0; // 100% transparente
        c('.pizzaWindowArea').style.display = 'flex'; // 100% transparente
        setTimeout(()=> {
            c('.pizzaWindowArea').style.opacity = 1; // faz um delay p/efeito de transição da transparencia
        })

        // evento de fechar o modal
        cs('.pizzaInfo--cancelMobileButton, .pizzaInfo--cancelButton').forEach((item)=>{
            item.addEventListener('click', closeModal);
        });

    });



    //inclui a informação dentro do pizza-area
    // note que usamos o append - que faz uma adição
    // incremental no html 
    c('.pizza-area').append( pizzaItem );
});

// eventos do modal
function closeModal() {
         // efeito de abertura do modal
         c('.pizzaWindowArea').style.opacity = 0; // 100% transparente
         setTimeout(()=> {
            c('.pizzaWindowArea').style.display = 'none'; // display none apos 0,5 seg
        }, 500);
    
}

//evento para adicionar quantidade
c('.pizzaInfo--qtmais').addEventListener('click', (ev)=> {
    modalQt++;
    c('.pizzaInfo--qt').innerHTML = modalQt;
});

//evento para subtrair quantidade
c('.pizzaInfo--qtmenos').addEventListener('click', (ev)=> {
    if( modalQt > 1) {
    modalQt--;
    c('.pizzaInfo--qt').innerHTML = modalQt;
    }
});

// evento de selecao dos tamanhos
cs('.pizzaInfo--size').forEach((item)=>{
    item.addEventListener('click', (ev)=>{
    //primeiro tira o selected de todos elementos
    c('.pizzaInfo--size.selected').classList.remove('selected');
    // depois marca como selected aquele que foi marcado
    item.classList.add('selected');
    });
});

// evento de adicionar ao carrinho
c('.pizzaInfo--addButton').addEventListener('click', (ev)=> {
    let size = c('.pizzaInfo--size.selected').getAttribute('data-key');
    let identifier = pizzaJson[modalKey].id+'@'+size; //identificador da pizza+tamanho
    
    // verificar se a mesma pizza (id e tamanho) ja foi adicionada
    let key = cart.findIndex((item)=> item.identifier == identifier); // retorna -1 caso nao exista
    if(key > -1){ 
        cart[key].quant += modalQt;
    } else
    {
        cart.push({
            identifier,
            id:pizzaJson[modalKey].id,
            size: size,
            quant: parseInt(modalQt)
        });
    }
    updateCart();
    closeModal();
    
});

// criando evento do click no carrinho de compras mobile
c('.menu-openner').addEventListener('click', () => {
    if(cart.length > 0){
        c('aside').style.left = "0";
    }
});
// evento para fechar carrinho no mobile
c('.menu-closer').addEventListener('click', () => {
    c('aside').style.left = "100vw";
});



// abrir o carrinho
function updateCart(){
    let subTotal = 0;
    let desconto = 0;
    let total = 0;

    c('.menu-openner span').innerHTML = cart.length;

    if(cart.length > 0) {
        c('aside').classList.add('show');
        //zera tudo que tiver no cart
        c('.cart').innerHTML = '';
        for (let i in cart) {

            //localiza id da pizza no Json
            let pizzaItem = pizzaJson.find((item)=> item.id == cart[i].id );
              // monta o nome da pizza com o tamanho
            let pizzaSizeName; 
            switch (cart[i].size) {
                case "0":
                    pizzaSizeName = 'P';
                    break;
                case "1":
                    pizzaSizeName = 'M';
                    break;
                case "2":
                    pizzaSizeName = 'G';
                    break;
            }
            let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;
          // faz o clone do cart--item
            let cartItem = c('.models .cart--item').cloneNode(true);
            cartItem.querySelector('img' ).src = pizzaItem.img;
            cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
            cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].quant;

 
            //evento para adicionar quantidade
            cartItem.querySelector('.cart--item-qtmais').addEventListener('click', (ev)=> {
                cart[i].quant++;
                updateCart();
                console.log('mais:'+i);
            });

            //evento para subtrair quantidade
            cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', (ev)=> {
                console.log('menos:'+i);
                if( cart[i].quant > 1) {
                    cart[i].quant--;
                    updateCart();
                }else {
                    cart.splice(i,1);
                    updateCart();
                }
            });

            // adiciona o clone ao cart
            c('.cart').append(cartItem);
            // calcula o subtotal
            subTotal += cart[i].quant * pizzaItem.price;
        }
        // atualiza valores desconto e total
        desconto = subTotal * 0.1;
        total = subTotal - desconto;
        c('.subtotal span:last-child').innerHTML = `R$ ${subTotal.toFixed(2)}`;
        c('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`;
        c('.total.big span:last-child').innerHTML = `R$ ${total.toFixed(2)}`;
    }else {
        c('aside').classList.remove('show');  // para esconder o carrinho
        c('aside').style.left = "100vw"; // para esconder no mobile
    }
}