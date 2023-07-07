
// Global selectors

const MAX_CHAR = 150;
const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api'

const counterEl = document.querySelector('.counter')
const textAreaEl = document.querySelector('.form__textarea')
const formEl = document.querySelector('.form')
const feedbackEl = document.querySelector('.feedbacks')
const submitBtnEl = document.querySelector('.submit-btn')
const spinnerEl  = document.querySelector('.spinner')
const hashtagListEl = document.querySelector('.hashtags')

const renderFeedbackItem = feedbackItem => { // Render feedback item

    const feedbackItemHTML = `
    
        <li class="feedback">

            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedbackItem.upvoteCount}</span>
            </button>

            <section class="feedback__badge">
                <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
            </section>

            <div class="feedback__content">
                <p class="feedback__company">${feedbackItem.company}</p>
                <p class="feedback__text">${feedbackItem.text}</p>
            </div>

            <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'New' : `${feedbackItem.daysAgo}d`}</p>

        </li>

    `
    feedbackEl.insertAdjacentHTML('beforeend', feedbackItemHTML);
    
}


// Counter component

    const inputHandler = () => {
        
        const maxCharLength = MAX_CHAR;
        const currentCharValue = textAreaEl.value.length;
        const newValue = +currentCharValue; // Converting from string to number
        counterEl.textContent = maxCharLength - newValue;

    }

    textAreaEl.addEventListener('input', inputHandler)


// Form component

    // Visual indicator function
    const visualIndicator = textCheck => {

        const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid'

        formEl.classList.add(className)

            // Remove class after 3 seconds
            setTimeout(() => {
                text = 
                formEl.classList.remove(className)
            }, 2500)
    }


    const submitHandler = (event) => {

        event.preventDefault(); // preventing form to refresh
        const text = textAreaEl.value; 

        // Text validation
        if (text.includes('#') && text.length >= 5) {
           
            visualIndicator('valid') 
      
        } else {
           
            visualIndicator('invalid')
            
            // Focus again & stop the function
            textAreaEl.focus();
            return;
        }

        // Extract text elements to render the component
        const hashTag = text.split(' ').find(word => word.includes('#'));
        const company = hashTag.substring(1);
        const badgeLetter = company.substring(0, 1).toUpperCase();
        const upvoteCount = 0;
        const daysAgo = 0; 

        const feedbackItem = {
            upvoteCount: upvoteCount,
            daysAgo: daysAgo,
            company: company,
            badgeLetter: badgeLetter,
            text: text
        }

        // Add new feedback item to the HTML
        renderFeedbackItem(feedbackItem);

        // Post new feedback item to the server
        fetch(`${BASE_API_URL}/feedbacks`, {
            method: 'POST',
            body: JSON.stringify(feedbackItem),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }  
        })
        .then(res => res.json())
        .then(data => {
            if(!data.ok) {
                console.log('Something went wrong!')
                return;
            } else {
                console.log('Feedback submitted successfully!')
            }
        })
        .catch(err => {
            console.log(err)
        })

        // Reset all values 
        textAreaEl.value = '';
        submitBtnEl.blur();
        counterEl.textContent = MAX_CHAR;
    }

    formEl.addEventListener('submit', submitHandler) 

// Get feedback list from the server

    fetch(`${BASE_API_URL}/feedbacks`)
        .then(res => res.json())
        .then(data => {
            // Remove spinner
            spinnerEl.remove();
            // Loop through each array and create/render HTML list element
            data.feedbacks.forEach(feedbackItem => {
                renderFeedbackItem(feedbackItem);  
            })
        })
        .catch(err => {
            feedbackEl.textContent = ` Failed to fetch data, Error Message: ${err}.`
        })

// Upvote counter and feedback expand

    feedbackEl.addEventListener('click', event => {
        const clickedEl = event.target;
        const statusClickedEl = clickedEl.className.includes('upvote');

        if (statusClickedEl) {

            const upvoteBtnEl = clickedEl.closest('.upvote')

            // Select and update the upvote count value of the closest upvote button
            const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count')

            let currentUpvoteVal = +upvoteCountEl.textContent;

            upvoteCountEl.textContent = ++currentUpvoteVal;

            // Disable the button after 1 click to avoid spam & double click
            upvoteBtnEl.disabled = true;

        } else {

            // Expand feedback item
            clickedEl.closest('.feedback').classList.add('feedback--expand');
            setTimeout(() => {
                clickedEl.closest('.feedback').classList.remove('feedback--expand')
            }, 3500) 

        }
    })

// Hastag filter component

    const filterHandler = event => {

        const clickedEl = event.target;
        // Extract the selected text item, remove the hashtag from it and to uppercase
        const filteredEl = clickedEl.textContent.substring(1).toUpperCase().trim();
   
        // Stop the function if the user clicks outside the button
        if (clickedEl.className === 'hashtags') return;

        // Run a loop on all list item and reject text 
        feedbackEl.childNodes.forEach(childNode => {
            if (childNode.nodeType === 3) return;

            // Extract the company name from the feedback item
            const feedbackCompanyName = childNode.querySelector('.feedback__company').textContent.toUpperCase().trim();
            
            // Remove childNode if the hashtag does not match the company name
            if (filteredEl !== feedbackCompanyName) {
                childNode.remove()
            }
        })
    }

    hashtagListEl.addEventListener('click', filterHandler) 