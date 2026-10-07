// Estado Global
let estado = {
    tamanhoFonte: 100,
    linhaAtiva: false,
    leituraAtiva: false,
    elementoLinha: null
};

const synth = window.speechSynthesis;

// CONTROLE DO PAINEL

function AlternarPainel() {
    const painel = document.getElementById('painel-lateral');
    const isAberto = painel.classList.contains('aberto');
    
    if(isAberto) {
        painel.classList.remove('aberto');
        painel.setAttribute('aria-hidden', 'true');
    } else {
        painel.classList.add('aberto');
        painel.setAttribute('aria-hidden', 'false');
    }
}


// AS 8 FUNÇÕES DE ACESSIBILIDADE

function AumentarTexto() {
    if (estado.tamanhoFonte < 160) {
        estado.tamanhoFonte += 10;
        document.documentElement.style.fontSize = `${estado.tamanhoFonte}%`;
    }
}

function DiminuirTexto() {
    if (estado.tamanhoFonte > 80) {
        estado.tamanhoFonte -= 10;
        document.documentElement.style.fontSize = `${estado.tamanhoFonte}%`;
    }
}

function AlternarContraste() {
    document.body.classList.toggle("alto-contraste");
}

function TrocarFonte() {
    document.body.classList.toggle("fonte-dislexia");
}

function PausarAnimacao() {
    document.body.classList.toggle("pausar-animacoes");
}

function LinhaLeitura() {
    if (!estado.linhaAtiva) {
        const linha = document.createElement("div");
        linha.classList.add("linha-guia-leitura");
        document.body.appendChild(linha);
        
        estado.elementoLinha = linha;
        estado.linhaAtiva = true;
        document.addEventListener("mousemove", moverLinha);
    } else {
        if (estado.elementoLinha) estado.elementoLinha.remove();
        document.removeEventListener("mousemove", moverLinha);
        estado.elementoLinha = null;
        estado.linhaAtiva = false;
    }
}

function moverLinha(evento) {
    if (estado.elementoLinha) {
        estado.elementoLinha.style.top = `${evento.clientY}px`;
    }
}

function IniciarLeitura() {
    if (synth.speaking) return;

    const conteudoMain = document.getElementById("conteudo-principal");
    if (conteudoMain) {
        const textoParaLer = conteudoMain.innerText;
        const utterance = new SpeechSynthesisUtterance(textoParaLer);
        utterance.lang = 'pt-BR';
        
        synth.speak(utterance);
        estado.leituraAtiva = true;

        utterance.onend = function() {
            estado.leituraAtiva = false;
        };
    }
}

function PararLeitura() {
    if (synth.speaking || synth.pending) {
        synth.cancel();
        estado.leituraAtiva = false;
    }
}


// RESTAURAR CONFIGURAÇÕES

function Restaurar() {
    estado.tamanhoFonte = 100;
    document.documentElement.style.fontSize = "100%";
    
    document.body.classList.remove("alto-contraste", "fonte-dislexia", "pausar-animacoes");
    
    PararLeitura();
    
    if (estado.linhaAtiva) {
        LinhaLeitura(); 
    }
}
