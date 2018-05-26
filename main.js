getProducers();

function checkLibertyBlock() {
    document.querySelector("input[value=libertylion1]").checked = true
    updateSelectedBPs();
}

function filterProds () {
    var search = document.getElementById('filter-prods').value;
    document.querySelectorAll('.prod-row').forEach(function (row) {
        if (search === "")
            row.style.display = "table-row";
        else if (row.childNodes[3].textContent.indexOf(search) > -1)
            row.style.display = "table-row";
        else
            row.style.display = "none";
    });
}

function getEos() {
	var privateKey = document.getElementById('private-key').value;
	var config = {
		keyProvider: privateKey,
		httpEndpoint: "http://13.71.191.137:8889",
		broadcast: true,
		sign: true,
        chainId: "a628a5a6123d6ed60242560f23354c557f4a02826e223bb38aad79ddeb9afbca",
        expireInSeconds: 30
	}
	return Eos.Testnet(config);
}

function getProducers() {
    var eos = getEos();
    var params = {
        json: true,
        scope: "eosio",
        code: "eosio",
        table: "producers", 
        limit: 200
    }
    var tbody = document.querySelector("#block-producers tbody");

    return eos.getTableRows(params).then(resp => {
        var sorted = resp.rows.sort((a,b) => Number(a.total_votes) > Number(b.total_votes) ? -1:1);
        sorted.map(prod => `<tr class="prod-row">
            <td><input type="checkbox" name="vote-prods" value="${prod.owner}"></td>
            <td>${prod.owner}</td>
            <td>${prettyNumber(prod.total_votes)}</td>
        </tr>`)
        .forEach(row => tbody.innerHTML += row);

        document.getElementsByName('vote-prods').forEach(e => {
            e.onclick = updateSelectedBPs;
        });

    });

}

function getSelectedBPs () {
    var checked = []
    document.getElementsByName('vote-prods').forEach(function (prod) {
        if (prod.checked)
            checked.push(prod.value);
    });
    return checked;
}

function updateSelectedBPs() {
    var checked = getSelectedBPs();
    document.getElementById("selected-bps").innerHTML = checked.join(', ');
}

function prettyNumber(num) {
    num = parseInt(parseInt(num) / 1e10 * 1.4);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function vote () {
    var eos = getEos();
    var selectedBPs = getSelectedBPs();
    if (selectedBPs.length > 30) {
        var alert = `<div class="alert alert-danger" role="alert">
            Maximum 30 block producers can be selected
        </div>`
        document.getElementById('alerts').innerHTML += alert;
    }

    var sortedBPs = selectedBPs.sort();
    eos.transaction(tr => {
        tr.voteproducer("libertylion1", "", sortedBPs);
    }).then(tx => {
        var alert = `<div class="alert alert-success" role="alert">
            Your vote has been cast. Refresh page for new vote counts.<br>
            TxID: ${tx.transaction_id}
        </div>`
        document.getElementById('alerts').innerHTML += alert;
        document.getElementById('private-key').value = "";
    }).catch(err => {
        err = JSON.parse(err);
        var alert = `<div class="alert alert-danger" role="alert">
            Error: ${err.error.what}
        </div>`;
        document.getElementById('alerts').innerHTML += alert;

    });
}

function sendAlert (message, type) {
    var alert = `<div class="alert alert-warning" role="alert"></div>`
}
