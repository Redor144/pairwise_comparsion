$(document).ready(function() {
    loadExperts();
    loadCriteria();
    loadNumberOfAlternatives();
    loadAllExpertMatrices();
});

function loadExperts() {
    $.ajax({
        url: '/get_experts',
        type: 'GET',
        success: function(response) {
            const expertsSelect = $('#experts');
            expertsSelect.empty();
            if (response.experts.length === 0) {
                expertsSelect.append(new Option("No experts available", ""));
            }
            else {
                response.experts.forEach((expert) => {
                    expertsSelect.append(new Option(expert, expert));
                });
            }
        },
        error: function() {
            alert('Failed to load experts');
        }
    });
}

function loadCriteria() {
    $.ajax({
        url: '/get_criteria',
        type: 'GET',
        success: function(response) {
            const criteriaSelect = $('#criterion');
            criteriaSelect.empty();
            if (response.criteria.length === 0) {
                criteriaSelect.append(new Option("No criteria available", ""));
            } else {
                response.criteria.forEach((criterion) => {
                    criteriaSelect.append(new Option(criterion, criterion));
                });
            }
        },
        error: function() {
            alert('Failed to load criteria');
        }
    });
}

function loadNumberOfAlternatives() {
    $.ajax({
        url: '/get_number_of_alternatives',
        type: 'GET',
        success: function(response) {
            const numAlternatives = response.number_of_alternatives;
            const alternativesNames = response.alternative_names;
            generateMatrixInput(numAlternatives, alternativesNames);
            updateExpertMatrices();
        },
        error: function() {
            alert('Failed to load the number of alternatives');
        }
    });
}

function enableReciprocalUpdates() {
    const labelToReciprocal = {
        "1/9": "9",
        "1/8": "8",
        "1/7": "7",
        "1/6": "6",
        "1/5": "5",
        "1/4": "4",
        "1/3": "3",
        "1/2": "2",
        "0": "0",
        "1": "1",
        "2": "1/2",
        "3": "1/3",
        "4": "1/4",
        "5": "1/5",
        "6": "1/6",
        "7": "1/7",
        "8": "1/8",
        "9": "1/9"
    };

    const matrixInputs = document.querySelectorAll('.matrix-input');

    matrixInputs.forEach(input => {
        input.addEventListener('change', function () {
            const row = parseInt(this.dataset.row);
            const col = parseInt(this.dataset.col);

            const selectedLabel = this.options[this.selectedIndex].text;
            const reciprocalLabel = labelToReciprocal[selectedLabel];
            const reciprocalInput = document.querySelector(`.matrix-input[data-row="${col}"][data-col="${row}"]`);

            if (reciprocalInput) {
                const optionToSelect = Array.from(reciprocalInput.options).find(
                    option => option.text === reciprocalLabel
                );
                if (optionToSelect) {
                    optionToSelect.selected = true;
                }
            }
        });
    });
}


function generateMatrixInput(numAlternatives, alternativesNames) {
    const container = $('#matrixContainer');
    container.empty();

    if (alternativesNames.length !== numAlternatives) {
        alert('Number of labels must match the number of alternatives!');
        return;
    }

    if (numAlternatives > 0) {
        let tableHtml = '<table class="table table-bordered">';
        
        tableHtml += '<thead><tr><th></th>'; 
        alternativesNames.forEach(alternativeName => {
            tableHtml += `<th>${alternativeName}</th>`;
        });
        tableHtml += '</tr></thead>';

        tableHtml += '<tbody>';
        for (let i = 0; i < numAlternatives; i++) {
            tableHtml += `<tr><th>${alternativesNames[i]}</th>`;

            for (let j = 0; j < numAlternatives; j++) {
                if (i === j) {
                    tableHtml += `<td><input type="number" class="form-control" value="1" readonly></td>`;
                } else {
                    tableHtml += `<td><select class="form-control matrix-input" data-row="${i}" data-col="${j}">`;
                    const values = [
                        { value: 1 / 9, label: "1/9" },
                        { value: 1 / 8, label: "1/8" },
                        { value: 1 / 7, label: "1/7" },
                        { value: 1 / 6, label: "1/6" },
                        { value: 1 / 5, label: "1/5" },
                        { value: 1 / 4, label: "1/4" },
                        { value: 1 / 3, label: "1/3" },
                        { value: 1 / 2, label: "1/2" },
                        { value: 0, label: "0" },
                        { value: 1, label: "1" },
                        { value: 2, label: "2" },
                        { value: 3, label: "3" },
                        { value: 4, label: "4" },
                        { value: 5, label: "5" },
                        { value: 6, label: "6" },
                        { value: 7, label: "7" },
                        { value: 8, label: "8" },
                        { value: 9, label: "9" },
                    ];
                    values.sort((a, b) => b - a); 

                    values.forEach(item => {
                        const selected = item.value === 1 ? 'selected' : '';
                        tableHtml += `<option value="${item.value.toFixed(2)}" ${selected}>${item.label}</option>`;
                    });

                    tableHtml += '</select></td>';
                }
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody>';

        tableHtml += '</table>';
        container.html(tableHtml);

        enableReciprocalUpdates();

    } else {
        container.html('<p>No alternatives available. Please add alternatives first.</p>');
    }
}


function addAlternative() {
    const alternativeName = $('#alternativeName').val();
    $.ajax({
        url: '/add_alternative',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ alternative_name: alternativeName }),
        success: function(response) {
            alert(response.message);
            loadCriteria();
            loadNumberOfAlternatives();
        },
        error: function(response) {
            alert(response.responseJSON.error);
        }
    });
}

function addCriterion() {
    const criterionName = $('#criterionName').val();
    $.ajax({
        url: '/add_criterion',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ criterion_name: criterionName }),
        success: function(response) {
            alert(response.message);
            loadCriteria();
        },
        error: function(response) {
            alert(response.responseJSON.error);
        }
    });
}

function addExpert() {
    const expertName = $('#expertName').val();
    $.ajax({
        url: '/add_expert',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ expert_name: expertName }),
        success: function(response) {
            alert(response.message);
            loadExperts();
        },
        error: function(response) {
            alert(response.responseJSON.error);
        }
    });
}

function addExpertMatrix() {
    const expert = $('#experts').val();
    const criterion = $('#criterion').val();
    let numAlternatives = $('#matrixContainer table tr').length - 1;
    let matrix = [];
    for (let i = 0; i < numAlternatives; i++) {
        let row = [];
        for (let j = 0; j < numAlternatives; j++) {
            if (i === j) {
                row.push(1);
            } else {
                const value = $(`select[data-row="${i}"][data-col="${j}"]`).val();
                row.push(parseFloat(value));
            }
        }
        matrix.push(row);
    }

    $.ajax({
        url: '/add_expert_matrix',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ expert_name: expert, criterion: criterion, matrix: matrix }),
        success: function(response) {
            alert(response.message);
            loadAllExpertMatrices();
        },
        error: function(response) {
            alert(response.responseJSON.error);
        }
    });
}

function calculateFinalRanking() {
    const rankingMethods = [
        { url: '/calculate_final_ranking_topsis', label: 'TOPSIS' },
        { url: '/calculate_final_ranking_consistency_adjusted', label: 'CAM' },
        { url: '/calculate_final_ranking_basic', label: 'BASIC' }
    ];

    let finalRankingHTML = '';

    function fetchRanking(index) {
        if (index >= rankingMethods.length) {
            getInconsistencyIndices();
            return;
        }

        const method = rankingMethods[index];
        $.ajax({
            url: method.url,
            type: 'GET',
            success: function(response) {
                if (response.ranking) {
                    let rankingHTML = `<h4>Final Ranking (${method.label})</h4>`;
                    rankingHTML += '<ul class="list-group">';
                    response.ranking.forEach((item) => {
                        rankingHTML += `<li class="list-group-item">${item.alternative}: ${item.score.toFixed(2)}</li>`;
                    });
                    rankingHTML += '</ul>';
                    finalRankingHTML += rankingHTML;
                }
                fetchRanking(index + 1);
            },
            error: function() {
                fetchRanking(index + 1);
            }
        });
    }

    fetchRanking(0);
}


function uploadModel() {
    const fileInput = $('#modelFile')[0];
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    $.ajax({
        url: '/upload_model',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            alert(response.message);
            loadExperts();
            loadCriteria();
            loadNumberOfAlternatives();
            loadAllExpertMatrices();
        },
        error: function(response) {
            alert(response.responseJSON.error);
        }
    });
}

function downloadModel() {
    const filename = $('#downloadFileName').val() || 'ahp_model.json';
    window.location.href = `/download_model?filename=${filename}`;
}

function clearModel() {
    $.ajax({
        url: '/clear_model',
        type: 'GET',
        success: function(response) {
            alert(response.message);
            loadCriteria();
            loadExperts();
            loadNumberOfAlternatives();
        },
        error: function(response) {
            alert(response.responseJSON.error);
        }
    });
}
function getInconsistencyIndices() {
    $.ajax({
        url: '/get_inconsistency_indices',
        type: 'GET',
        success: function(response) {
            if (response.inconsistency_indices) {
                let indicesHTML = '<h4>Inconsistency Indices</h4>';
                indicesHTML += '<ul class="list-group">';
                for (const [expert, criteria] of Object.entries(response.inconsistency_indices)) {
                    indicesHTML += `<li class="list-group-item"><strong>Expert: ${expert}</strong>`;
                    indicesHTML += '<ul>';
                    for (const [criterion, index] of Object.entries(criteria)) {
                        indicesHTML += `<li>Criterion: ${criterion}, Index: ${index.toFixed(2)}</li>`;
                    }
                    indicesHTML += '</ul></li>';
                }
                indicesHTML += '</ul>';
                $('#rankingResult').html(indicesHTML);
            } else {
                $('#rankingResult').html('<p>No inconsistency indices data available.</p>');
            }
        },
        error: function() {
            alert('Failed to get inconsistency indices.');
        }
    });
}


function calculateAllRankings() {
    $.get('/calculate_all_rankings', function(data) {
        const missingCriteria = data.missing_criteria;
        let missingResults = '<h4>Missing Criteria</h4>';
        if (Object.keys(missingCriteria).length > 0) {
            missingResults += '<ul class="list-group">';
            for (const expert in missingCriteria) {
                missingResults += `<li class="list-group-item">${expert} is missing: <strong>${missingCriteria[expert].join(', ')}</strong></li>`;
            }
            missingResults += '</ul>';
        } else {
            missingResults += '<p>All experts have filled all criteria.</p>';
        }
        $('#missingCriteriaResults').html(missingResults);

        const rankings = data.rankings;
        let rankingResults = '<h4>Rankings</h4>';
        rankingResults += '<ul class="list-group">';
        rankingResults += '<li class="list-group-item"><strong>TOPSIS</strong><ul>';
        rankingResults += rankings.TOPSIS.map(r => `<li>${r.alternative}: <strong>${r.score.toFixed(2)}</strong></li>`).join('');
        rankingResults += '</ul></li>';
        rankingResults += '<li class="list-group-item"><strong>Consistency Adjusted</strong><ul>';
        rankingResults += rankings['Consistency Adjusted'].map(r => `<li>${r.alternative}: <strong>${r.score.toFixed(2)}</strong></li>`).join('');
        rankingResults += '</ul></li>';
        rankingResults += '<li class="list-group-item"><strong>Basic</strong><ul>';
        rankingResults += rankings.Basic.map(r => `<li>${r.alternative}: <strong>${r.score.toFixed(2)}</strong></li>`).join('');
        rankingResults += '</ul></li>';
        rankingResults += '</ul>';
        $('#rankingResults').html(rankingResults);

        const inconsistencyIndices = data.inconsistency_indices;
        let inconsistencyResults = '<h4>Inconsistency Indices</h4>';
        inconsistencyResults += '<ul class="list-group">';
        for (const expert in inconsistencyIndices) {
            inconsistencyResults += `<li class="list-group-item"><strong>${expert}</strong><ul>`;
            for (const criterion in inconsistencyIndices[expert]) {
                inconsistencyResults += `<li>${criterion}: <strong>${inconsistencyIndices[expert][criterion].toFixed(4)}</strong></li>`;
            }
            inconsistencyResults += '</ul></li>';
        }
        inconsistencyResults += '</ul>';
        $('#inconsistencyResults').html(inconsistencyResults);

    }).fail(function(error) {
        $('#rankingResults').html('<p>Error fetching data.</p>');
        $('#inconsistencyResults').html('');
        $('#missingCriteriaResults').html('');
    });
}

function loadAllExpertMatrices() {
    $.ajax({
        url: '/get_all_expert_matrices',
        type: 'GET',
        success: function(response) {
            const container = $('#allExpertMatrices');
            container.empty();

            if (response.expert_matrices) {
                for (const criterion of Object.keys(response.expert_matrices[Object.keys(response.expert_matrices)[0]])) {
                    let criterionHTML = `<h4>Criterion: ${criterion}</h4><div class="row">`;

                    for (const [expert, criteria] of Object.entries(response.expert_matrices)) {
                        const matrix = criteria[criterion];
                        if (matrix) {
                            let matrixHTML = `<div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                                <h5>Expert: ${expert}</h5>
                                <table class="table table-bordered table-sm">
                                    ${matrix.map(row => `
                                        <tr>
                                            ${row.map(value => `<td>${value.toFixed(2)}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </table>
                            </div>`;
                            criterionHTML += matrixHTML;
                        }
                    }

                    criterionHTML += '</div>';
                    container.append(criterionHTML);
                }
            } else {
                container.html('<p>No expert matrices available.</p>');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            $('#allExpertMatrices').html('<p>Error retrieving all expert matrices.</p>');
        }
    });
}
