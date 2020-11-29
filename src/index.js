require('./css/index.scss');

const scryfall = require('scryfall-client');

const IDS_PER_SEARCH = 18;

const btn = document.getElementById('go-btn');
const ignoreBasics = document.getElementById('ignore-basics');
const total = document.getElementById('total')
const error = document.getElementById('error')
const progress = document.getElementById('progress')
const tableContainer = document.querySelector('.table')
const decklist = document.getElementById('decklist');
function setDisabled (isDisabled) {
  if (isDisabled) {
    decklist.setAttribute('disabled', true);
    btn.setAttribute('disabled', true);
    decklist.classList.add('is-loading');
    btn.classList.add('is-loading');
  } else {
    decklist.removeAttribute('disabled');
    btn.removeAttribute('disabled');
    decklist.classList.remove('is-loading');
    btn.classList.remove('is-loading');
  }
}

btn.addEventListener("click", () => {
  setDisabled(true)

  const deck = decklist.value.split('\n').filter((entry) => {
    if (!entry) {
      // ignore blank entries
      return;
    }

    if (entry.charAt(0) === '/') {
      // ignore entries that start with a / denoting a comment
      return;
    }

    return entry;
  }).map((entry) => {
    const matches = entry.match(/^((\d*)(x?) )?(.*)$/);
    return {
      qty: matches[2],
      name: matches[4]
    }
  });

  // include an extra one for the getCollection request
  const totalProgress = Math.ceil(deck.length / IDS_PER_SEARCH) + 1;
  progress.setAttribute("max", totalProgress);

  const table = document.getElementById('card-entries');

  total.classList.add('is-hidden');
  tableContainer.classList.add('is-hidden');
  table.innerHTML = "";
  error.innerText = "";
  progress.value = 0;
  progress.innerText = progress.value + "%";
  progress.classList.remove('is-hidden');

  setTimeout(() => {
    progress.value +1;
    progress.innerText = progress.value + "%";
  }, 500);

  scryfall.getCollection(deck.map(e => {return {name: e.name}})).then((collection) => {
    progress.value = 1;
    progress.innerText = progress.value + "%";
    const batches = [];
    const oracleIds = collection.map(c => c.oracle_id);

    while (oracleIds.length) {
      const query = "(" + oracleIds.splice(0, IDS_PER_SEARCH).map(id => `oracle_id:"${id}"`).join(" or ") + ") prefer:usd-low usd>0";
      batches.push(
        scryfall.search(query)
        .then(res => {
          progress.value += 1;

          return res;
        })
      )
    }

    collection.warnings.forEach(w => {
      error.innerText += w + '\n';
    });
    collection.not_found.forEach(e => {
      error.innerText += e.name + ' could not be found. Check your spelling.\n';
    });

    return Promise.all(batches);
  }).then((results) => {
    const cards = results.flat();
    let totalPrice = 0;

    const moneyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    cards.sort((a, b) => (a.name > b.name) ? 1 : -1).forEach(c => {
      let price;
      // if the card can't be found, assume a qty of 1
      const qty = (deck.find(e => e.name.split(' //')[0] === c.name.split(' //')[0]) || {qty: 1}).qty || 1;

      switch (c.name.toLowerCase()) {
        case "island":
        case "forest":
        case "mountain":
        case "swamp":
        case "plains":
          if (ignoreBasics.checked) {
            price = 0;
            break;
          }
        default:
          price = Number(c.getPrice() || 0);
      }

      totalPrice += price * 100 * qty;

      const tr = document.createElement('tr');
      const quantityElement = document.createElement('td');
      quantityElement.innerText = qty;
      const nameElement = document.createElement('td');
      nameElement.innerHTML = `<a href="${c.scryfall_uri}" target="_blank">${c.name}</a>`;
      const priceElement = document.createElement('td');
      priceElement.innerText = moneyFormatter.format(price);

      tr.appendChild(quantityElement);
      tr.appendChild(nameElement);
      tr.appendChild(priceElement);

      table.appendChild(tr);
    });

    setTimeout(() => {
      progress.classList.add('is-hidden');
      progress.value = 0;
      progress.innerText = progress.value + "%";

      setDisabled(false);

      total.innerText = "Total: " + moneyFormatter.format(totalPrice / 100);
      total.classList.remove('is-hidden');
      tableContainer.classList.remove('is-hidden');
    }, 750);
  }).catch(function (e) {
    error.innerText = e.message;
    setDisabled(false);
    progress.classList.add('is-hidden');
    progress.value = 0;
    progress.innerText = progress.value + "%";
  });
});
