document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const suggestions = document.getElementById('suggestions');

    searchInput.addEventListener('input', async () => {
        const query = searchInput.value;
        if (query.length < 3) {
            suggestions.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/product/autocomplete?q=${query}`);
            const products = await response.json();

            suggestions.innerHTML = products.map(product => `
                <div class="suggestion-item" data-id="${product.id}">
                    ${product.name}
                </div>
            `).join('');

            document.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    searchInput.value = item.textContent;
                    suggestions.innerHTML = '';
                    document.getElementById('search-form').submit();
                });
            });
        } catch (error) {
            console.error('Error fetching autocomplete suggestions:', error);
        }
    });
});
