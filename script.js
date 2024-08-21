document.addEventListener("DOMContentLoaded", function () {
    const wordInput = document.getElementById('word');
    const translationInput = document.getElementById('translation');
    const addWordBtn = document.getElementById('addWordBtn');
    const messageDiv = document.getElementById('message');
    const dictionaryBody = document.getElementById('dictionaryBody');
    const filterDateInput = document.getElementById('filterDate');
    const filterStatusSelect = document.getElementById('filterStatus');
    const downloadJsonBtn = document.createElement('button');

    let dictionary = [];

    downloadJsonBtn.textContent = "Download Dictionary as JSON";
    document.body.appendChild(downloadJsonBtn);

    // Load dictionary from localStorage if available
    if (localStorage.getItem('dictionary')) {
        dictionary = JSON.parse(localStorage.getItem('dictionary'));
        displayDictionary();
    }

    addWordBtn.addEventListener('click', function () {
        const word = wordInput.value.trim();
        const translation = translationInput.value.trim();

        if (!word || !translation) {
            messageDiv.textContent = "Please fill in both fields.";
            return;
        }

        const existingWord = dictionary.find(entry => entry.word.toLowerCase() === word.toLowerCase());

        if (existingWord) {
            messageDiv.textContent = "Word already exists in the dictionary.";
            clearInputs();
            return;
        }

        const newEntry = {
            word: word,
            translate: translation,
            add_date: new Date().toISOString().split('T')[0],
            learned: false
        };

        dictionary.push(newEntry);
        localStorage.setItem('dictionary', JSON.stringify(dictionary));
        displayDictionary();
        clearInputs();
        messageDiv.textContent = "Word added successfully!";
    });

    downloadJsonBtn.addEventListener('click', function () {
        const jsonStr = JSON.stringify(dictionary, null, 2); // Convert dictionary to JSON string
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dictionary.json';
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL object
    });

    function clearInputs() {
        wordInput.value = '';
        translationInput.value = '';
    }

    function displayDictionary() {
        const filteredDictionary = filterAndSortDictionary(dictionary);

        dictionaryBody.innerHTML = ''; // Clear the table body
        filteredDictionary.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.className = entry.learned ? 'learned' : 'not-learned';
            row.innerHTML = `
                <td>${entry.word}</td>
                <td>${entry.translate}</td>
                <td>${entry.add_date}</td>
                <td>${entry.learned ? 'Yes' : 'No'}</td>
                <td>
                    <button class="toggle-btn" data-index="${index}">Status</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            dictionaryBody.appendChild(row);
        });

        const toggleButtons = document.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                dictionary[index].learned = !dictionary[index].learned;
                localStorage.setItem('dictionary', JSON.stringify(dictionary));
                displayDictionary();
            });
        });

        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                dictionary.splice(index, 1);
                localStorage.setItem('dictionary', JSON.stringify(dictionary));
                displayDictionary();
            });
        });
    }

    function filterAndSortDictionary(dictionary) {
        const selectedDate = filterDateInput.value;
        const selectedStatus = filterStatusSelect.value;

        let filtered = dictionary.slice();

        if (selectedDate) {
            filtered = filtered.filter(entry => entry.add_date === selectedDate);
        }

        if (selectedStatus !== "all") {
            const isLearned = selectedStatus === "learned";
            filtered = filtered.filter(entry => entry.learned === isLearned);
        }

        filtered.sort((a, b) => a.word.localeCompare(b.word));
        
        return filtered;
    }

    filterDateInput.addEventListener('input', displayDictionary);
    filterStatusSelect.addEventListener('change', displayDictionary);
});
