function isButtonPresent(input) {
    return input.nextElementSibling && input.nextElementSibling.classList.contains('red-button');
}

function createButton(input) {
    const redButton = document.createElement('button');
    redButton.classList.add('red-button');
    redButton.textContent = 'Reply';
    Object.assign(redButton.style, {
        backgroundColor: '#3490ed',
        width: '35px',
        height: '35px',
        color: 'white',
        borderRadius: '20%',
        border: 'none',
        cursor: 'pointer',
        margin: '2px',
        textAlign: 'center',
        fontSize: '12px'
    });

    const span = input.closest('.ember-view').querySelector('.text-view-model');
    if (span) {
        redButton.setAttribute('data-span-id', span.id);
    }

    return redButton;
}

async function responseAi(postContent) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: `Please read the following post carefully and write a brief and engaging comment in response to it:
                        <post>
                        ${postContent}
                        </post>
                        Your comment should contain no more than 1 to 3 sentences. Write in a natural, conversational style, as if you were a person commenting on the post. Don't just repeat or summarize what the post says. Instead, try to bring something new and valuable to the discussion, such as sharing a related idea or experience, posing an insightful question, or expressing your reaction to the content of the post.
                        ## Response :
                        just reply with the comment you wrote. without any additional text.`
                    }
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
            return data.choices[0].message?.content;
        } else {
            console.error(await response.json());
        }
    } catch (error) {
        console.error('Error fetching AI response:', error);
    }
}

async function handleButtonClick() {
    const spanId = this.getAttribute('data-span-id');
    const span = document.getElementById(spanId);
    if (span) {
        const emberView = span.closest('.ember-view');
        const qlEditor = emberView.querySelector('.ql-editor');
        if (qlEditor) {
            const pElement = qlEditor.querySelector('p');
            if (pElement) {
                const content = await responseAi(span.innerText);
                pElement.innerText = content;
            }
        }
    }
}

const observer = new MutationObserver(mutationsList => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            const inputs = document.querySelectorAll('.comments-comment-box-comment__text-editor');

            inputs.forEach(input => {
                if (!isButtonPresent(input)) {
                    const redButton = createButton(input);
                    input.parentNode.insertBefore(redButton, input.nextSibling);

                    const updateComponentsTextDiv = input.closest('.ember-view').querySelector('.update-components-text');
                    if (updateComponentsTextDiv) {
                        const span = updateComponentsTextDiv.querySelector('.text-view-model');
                        if (span) {
                            const spanId = 'span-' + Math.random().toString(36).substring(7);
                            span.setAttribute('id', spanId);
                            redButton.setAttribute('data-span-id', spanId);
                        }
                    }

                    redButton.addEventListener('click', handleButtonClick);
                }
            });
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
