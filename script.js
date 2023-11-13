document.addEventListener('DOMContentLoaded', function() {
    // Array of organs - replace with your actual organ names as they appear in the CSV
    const organs = ['figado', 'vesicula', 'baco', 'rim_direito', 'rim_esquerdo', 'bexiga', 'adrenal_direita', 'adrenal_esquerda', 'estomago', 'intestino_delgado', 'colon', 'pancreas', 'peritonio', 'linfonodos', 'utero', 'ovarios', 'outros'];

fetch('/get_json_data')
    .then(response => response.json())
    .then(data => {
        // Populate the table with the data from the JSON file
        const table = document.getElementById('ultrasound-report');
        const tbody = table.querySelector('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            organs.forEach(organ => {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.name = organ;
                input.id = `${organ}-${row.id}`;
                input.checked = row[organ];
                td.appendChild(input);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error:', error));

    // Fetch and populate organ codes for each organ
    organs.forEach(organ => {
        fetch(`/get_organ_codes?organ=${organ}`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById(`${organ}-code`);
                data.forEach(code => {
                    const option = document.createElement('option');
                    option.value = code;
                    option.text = code;
                    select.appendChild(option);
                });
            })

            .catch(error => console.error('Error fetching organ codes:', error));
    });
});

function updateOrganData(organ) {
    if (organ === 'outros') {
        const outros = document.getElementById('outros').value;
        document.getElementById('outros-code').value = outros;
        return;

}
    const selectedCode = document.getElementById(`${organ}-code`).value;
    if (selectedCode) {
        fetch(`/get_report_data?code=${selectedCode}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById(`${organ}-comentarios`).value = data.comentarios || '';
                document.getElementById(`${organ}-impressaodiagnostica`).value = data.impressaodiagnostica || '';
                document.getElementById(`${organ}-normal`).checked = data.normal;
                document.getElementById(`${organ}-anormal`).checked = data.anormal;
            })
            .catch(error => console.error('Error:', error));
    }
}


function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('Ultrasound Report', 10, 10);

    const table = document.getElementById('ultrasound-report');
    let y = 30; // Starting Y position for the first row

    for (let i = 1, row; row = table.rows[i]; i++) { // Start from the first body row, skipping the header
        let x = 10; // Starting X position for the first column
        for (let j = 1, col; col = row.cells[j]; j++) { // Start from the second cell to skip 'Code'
            let text = col.textContent.trim() || ''; // Get text content
            if (col.querySelector('input[type="checkbox"]')) {
                // If there's a checkbox, check if it's marked
                text = col.querySelector('input[type="checkbox"]').checked ? 'X' : '';
            } else if (col.querySelector('input[type="text"]')) {
                // If there's a text input, get its value
                text = col.querySelector('input[type="text"]').value.trim();
            }
            doc.text(text, x, y); // Add text to PDF
            x += 40; // Increase X position for the next column
        }
        y += 10; // Increase Y position for the next row
    }

    doc.save('ultrasound_report.pdf');
}

