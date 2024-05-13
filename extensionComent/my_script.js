
function isButtonPresent(input) {
    return input.nextElementSibling && input.nextElementSibling.classList.contains('red-button');
}

// Función para crear el botón rojo
function createButton(input) {
    // Crear el botón rojo
    const blueButton = document.createElement('button');
    blueButton.classList.add('red-button');
    blueButton.textContent = 'Reply';
    // Estilo del botón rojo
    blueButton.style.backgroundColor = '#3490ed';
    blueButton.style.width = "35px"
    blueButton.style.height = "35px"
    blueButton.style.color = 'white';
    blueButton.style.borderRadius = '20%';
    blueButton.style.border = 'none';
    blueButton.style.cursor = 'pointer';
    blueButton.style.margin="2px"
    blueButton.style.textAlign = 'center'
    blueButton.style.fontSize = '12px'

    // Obtener el span correspondiente al input y asignar su id al atributo data-span-id del botón
    const span = input.closest('.ember-view').querySelector('.text-view-model');
    if (span) {
        blueButton.setAttribute('data-span-id', span.id);
    }

    return blueButton;
}



async function responseAi(postContent) {

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer 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`
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content:
                        `Please read the following post carefully and write a brief and engaging comment in response to it:

                        <post>
                        ${postContent}
                        </post>
                        
                        Your comment should contain no more than 1 to 3 sentences. Write in a natural, conversational style, as if you were a person commenting on the post. Don't just repeat or summarize what the post says. Instead, try to bring something new and valuable to the discussion, such as sharing a related idea or experience, posing an insightful question, or expressing your reaction to the content of the post.
                        
                        ## Response :
                        
                        just reply with the comment you wrote. without any additional text. `
                },
            ],
            model: 'llama3-70b-8192',
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            stop: null
        })
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data.choices[0].message?.content);

    return data.choices[0].message?.content
    } else {
        console.error(await response.json());
    }

    
}


// Función para manejar el evento click en el botón rojo
async function handleButtonClick() {
    // Obtener el id del span a partir del atributo data-span-id del botón
    // Seleccionar el span correspondiente al id
    const spanId = this.getAttribute('data-span-id');
    const span = document.getElementById(spanId);
    if (span) {
        console.log(span.innerText);
        const emberView = span.closest('.ember-view');
        const qlEditor = emberView.querySelector('.ql-editor');
                        if (qlEditor) {
                            const pElement = qlEditor.querySelector('p');
                            if (pElement) {
                                const content = await responseAi(span?.innerText)
                                console.log(content)
                                pElement.innerText =  content ;
                            }
                        }
}
}


// Observar cambios en el documento
const observer = new MutationObserver(function(mutationsList) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Obtener todos los elementos input
            const inputs = document.querySelectorAll('.comments-comment-box-comment__text-editor');

            inputs.forEach(input => {
                // Verificar si el botón rojo ya está presente en el input y si la caja mayor contiene un span con la clase text-view-model
                if (!isButtonPresent(input)) {
                    // Crear el botón rojo y agregarlo al input
                    const blueButton = createButton(input);
                    input.parentNode.insertBefore(blueButton, input.nextSibling);
            
                    // Modificar el span dentro del div con la clase update-components-text
                    const updateComponentsTextDiv = input.closest('.ember-view').querySelector('.update-components-text');           
                    if (updateComponentsTextDiv) {
                        const span = updateComponentsTextDiv.querySelector('.text-view-model');
                        if (span) {
                            // Generar un ID único para el span
                            const spanId = 'span-' + Math.random().toString(36).substring(7);
                            span.setAttribute('id', spanId); // Asignar el ID al span
                            blueButton.setAttribute('data-span-id', spanId); // Asignar el ID al atributo data-span-id del botón
                        }
                        
                    }
            
                    // Agregar evento click al botón
                    blueButton.addEventListener('click', handleButtonClick);
                }

            });
            
            
        }
    }
});

// Configurar el observador para que observe cambios en el documento
observer.observe(document.body, { childList: true, subtree: true });
