import Debug from './debug.js';

window.addEventListener("load", function() { Debug.log("hey there, welcome !");

	const enable_console_logs = false;

	// Global Fetch Variables
	var token;
	const shopList = new Map();
	var orders;
	var order_details, order_details_loaded;
	var order_lines , order_lines_loaded;
	var product_prices;

	// Starting DOM
	const start_DOM = `
		<header>
			<img class="synapsy-logo" alt="logo synapsy" src="img/logo_synapsy.png"/>
			<button class="get-token-btn" type="button">Get Token</button>
			<img class="loading-gif" alt="loading gif" src="img/loading.gif"/>
			<p class="ready-text">Ready to Go :)</p>
		</header>
		<main>
			<img class="get-token-arrow" alt="get token arrow" src="img/icon_arrow_up.webp"/>
			<div class="outer empty">
				<p class="get-token-text">Get your token to proceed</p>
				<div class="intro">
					<p class="disclaimer">Il faut bien commencer quelque part ;)</p>
					<button class="get-shops-btn" type="button">Récupérer la liste des boutiques</button>
				</div>
			</div>
		</main>
	`;
	document.body.insertAdjacentHTML("afterbegin", start_DOM);

	// Starting DOM Elements
	const header__get_token_btn = document.querySelector("header > .get-token-btn");
	const header__loading_gif = document.querySelector("header > .loading-gif");
	const header__ready_text = document.querySelector("header > .ready-text");
	const main__get_token_arrow = document.querySelector("main > .get-token-arrow");
	const main__outer = document.querySelector("main > .outer");
	const main__get_token_text = document.querySelector("main > .outer > .get-token-text");
	const main__intro = document.querySelector("main > .outer > .intro");
	const main__get_shops_btn = document.querySelector("main > .outer > .intro .get-shops-btn");

	// Global Input & Output Variables
	var input__shop;
	var input__start_date;
	var input__end_date;
	var output__header_orders_total;
	var output__header_payments_total;


	// Event Listeners
	header__get_token_btn.addEventListener("click", async() => {
		header__get_token_btn.style.display = "none";
		header__loading_gif.style.display = "block";

		// Get authentication token
		get_token()
			.then((json) => { //console.log(json);
				token = json.token;
				header__ready_text.innerHTML = "Ready to go :)"
				header__ready_text.style.borderColor = "green";
				main__get_token_arrow.style.visibility = "hidden";
				main__get_token_text.style.display = "none";
				main__intro.style.visibility = "visible";
			})
			.catch((error) => {
				header__ready_text.innerHTML = "Failed :(";
				header__ready_text.style.borderColor = "red";
				//console.log("error", error);
			})
			.finally(() => {
				header__loading_gif.style.display = "none";
				header__ready_text.style.display = "block";
			});
	});
	main__get_shops_btn.addEventListener("click", async() => {
		// Get available shops
		get_shops(token)
			.then((json) => {
				json.forEach(shop => { shopList.set(""+shop.id_magasin, shop.libelle); });
				//console.log(shopList);

				// remove intro DOM
				main__intro.remove();

				// append header DOM
				let options = "";
				shopList.forEach((key, value) => options += `<option value="${value}">${key}</option>\n`);
				main__outer.insertAdjacentHTML("beforeend", `
				<div class="header">
					<select class="shop-select">
						<option value="">Choisissez un restaurant</option>
						${options}
					</select>
					<div class="calendars">
						<p class="start-text">De</p>
						<input class="start-date" type="datetime-local">
						<p class="end-text">A</p>
						<input class="end-date" type="datetime-local">
					</div>
					<div class="totals">
						<p class="orders-total pinned">0 Commandes</p>
						<p class="payments-total pinned">Total 0.00€</p>
					</div>
				</div>
				`);
				main__outer.classList.remove("empty");

				// set input & output DOM
				input__shop = main__outer.querySelector(".header > .shop-select");
				input__shop.addEventListener("change", update);
				input__start_date = main__outer.querySelector(".header > .calendars > .start-date");
				input__start_date.addEventListener("change", update);
				input__end_date = main__outer.querySelector(".header > .calendars > .end-date");
				input__end_date.addEventListener("change", update);
				output__header_orders_total = main__outer.querySelector(".header > .totals > .orders-total");
				output__header_payments_total = main__outer.querySelector(".header > .totals > .payments-total");
			})
			.catch((error) => {
				console.log(error);
			});
	});

	// Update data on input change
	async function update() {
		// Proceed only if all data is set
		if (token == undefined || input__shop.value == "" || input__start_date.value == "" || input__end_date.value == "")
			return;

		// Reset content
		let previous_content = main__outer.querySelector(".content");
		if (previous_content)
			previous_content.remove();

		// Loader icon
		main__outer.insertAdjacentHTML("beforeend", `
			<div class="content">
				<img class="loader" alt="loading gif" src="img/loading.gif" />
			</div>
		`);

		// Fetch data init
		orders = []; order_details = new Map(), order_lines = new Map(); product_prices = new Map();
		order_details_loaded = false; order_lines_loaded = false;
		
		// Get Orders
		await get_orders(token, input__shop.value, input__start_date.value, input__end_date.value)
			.then((orders_) => {
				// Abort if empty
				if (orders_.length == 0) {
					main__outer.querySelector(".content").remove();
					return Promise.reject('user cancelled');
				}
				return orders_;
			})
			.then(async(orders_) => {
				orders = [...orders_];
				if (enable_console_logs)
					console.log("orders", orders);

				let i, j, k;
				// Get each order details
				for (i = 0; i < orders.length; i++) {
					await get_order_details(token, orders[i].id_vente)
						.then((details) => {
							order_details.set(orders[i].id_vente, details);
							if (enable_console_logs)
								console.log("order details", details);
						})
						.then(() => {
							// notify all order details parsed
							if (i === orders.length - 1)
								process_update(true, false);
						})
						.catch((error) => { console.log(error); });
				}

				// Get each order lines
				for (j = 0 ; j < orders.length; j++) {
					await get_order_lines(token, orders[j].id_vente)
						.then((lines) => {
							order_lines.set(orders[j].id_vente, lines);
							if (enable_console_logs)
								console.log("order lines", lines);
							return lines;
						})
						.then(async(lines) => {
							// Get each product pricing
							for (k = 1; k < lines.length; k++) {
								if (!product_prices.has(lines[k].id_produit)) {
									await get_product_pricing(token, lines[k].id_produit)
										.then((pricing) => {
											product_prices.set(lines[k].id_produit, pricing.prix_ttc);
											//console.log("product " + lines[k].id_produit + " price " + pricing.prix_ttc);
											//console.log("pricing", pricing);
										})
										.catch((error) => { console.log(error); });
								}
							}
							if (enable_console_logs)
								console.log("product prices", product_prices);
						})
						.then(() => {
							// notify all order lines parsed
							if (j === orders.length - 1)
								process_update(false, true);
						})
						.catch((error) => { console.log(error); });
				}

			})
			.catch((error) => {
				console.log(error);
		});

	}

	// Process data update
	async function process_update(details_loaded = false, lines_loaded = false) { //console.log("called " + details_loaded + "  " + lines_loaded);
		// Proceed only when all data is loaded
		if (details_loaded)
			order_details_loaded = true;
		if (lines_loaded)
			order_lines_loaded = true;
		if (!order_details_loaded || !order_lines_loaded)
			return;
		if (enable_console_logs)
			console.log("processing update");

		// Sort orders by common date
		let orders_by_common_date = new Map();
		orders.forEach(order => {
			let date = order.date_livraison.substring(0, 10);
			if (!orders_by_common_date.has(date))
				orders_by_common_date.set(date, [order.id_vente]);
			else
				orders_by_common_date.get(date).push(order.id_vente);
		});
		if (enable_console_logs)
			console.log("orders by common date", orders_by_common_date);

		// Reset content DOM
		let previous_content = main__outer.querySelector(".content");
		if (previous_content)
			previous_content.remove();
		main__outer.insertAdjacentHTML("beforeend", '<div class="content"></div>');

		let content = main__outer.querySelector(".content");
		let domstring = "";
		let i, j, id;
		
		// Update content DOM
		let total_orders = 0, total_payments = 0;
		orders_by_common_date.forEach((ids, date) => {
			// DOM formatting
			domstring = `
				<div class="content-row">
					<div class="header">
						<p class="date pinned pinned-header">${date}</p>
						<div class="totals">
							<p class="orders-total pinned">${ids.length} Commande${ids.length > 1 ? "s" : ""}</p>
							<p class="payments-total pinned">Total ${orders.filter(order => ids.includes(order.id_vente)).reduce((total, order) => { return total + order.total_ttc_net }, 0)}€</p>
						</div>
					</div>
				`;
				for (i = 0 ; i < ids.length; i++) {
					id = ids[i];
					const { date_livraison, tiers_nom, total_ttc_net } = order_details.get(id);
					domstring += `
					<div class="content">
						<div class="header">
							<div class="summary">
								<p class="id pinned">Id: ${id}</p>
								<p class="date pinned">du ${date_livraison}</p>
								<p class="from pinned">de ${tiers_nom}</p>
								<p class="total pinned">${total_ttc_net}€</p>
							</div>
							<p class="details">V détails V</p>
						</div>
						<div class="details" style="max-height: 0">
					`;
					for (j = 1; j < order_lines.get(id).length ; j++) {
						const { quantite, libelle_ligne, ordre_ligne, id_produit} = order_lines.get(id)[j];
						domstring += `
							<div class="details-row">
								<div class="description">
									<p class="quantity pinned">${quantite}</p>
									<p>*</p>
									<p class="name pinned">${libelle_ligne}</p>
								</div>
								<p class="unit-price pinned" ${ordre_ligne > 1 ? 'style="visibility: hidden"' : ""}>
									${ordre_ligne <= 1 ? "p.u. " + product_prices.get(id_produit) + "€" : ""}
								</p>
								<p class="total-price pinned">
									${ordre_ligne <= 1 ? "ttc " + quantite * product_prices.get(id_produit) + "€" : "inclus"}
								</p>
							</div>
						`;
					}
					domstring += `
						</div>
					</div>
					`;
				}
			domstring += `
				</div>
			`;

			// DOM insert
			content.insertAdjacentHTML("beforeend", domstring);

			// Update header outputs
			total_orders += ids.length;
			total_payments += orders.filter(order => ids.includes(order.id_vente)).reduce((total, order) => { return total + order.total_ttc_net }, 0);
			output__header_orders_total.innerHTML = total_orders + " Commande" + (total_orders > 1 ? "s" : "");
			output__header_payments_total.innerHTML = "Total " + total_payments + "€";
		});

		// Add expand/collapse event listeners
		let toggles = content.querySelectorAll(".content-row > .content > .header > .details");
		for (let x = 0; x < toggles.length; x++) {
			toggles[x].addEventListener("click", (event) => {
				let target = event.target.parentNode.nextElementSibling;
				if (target.style.maxHeight == "0px")
					target.style.maxHeight = "1000vh";
				else
					target.style.maxHeight = 0;
			});
		}

	}

	
});



/**
 * Fetches an authentication token
 * @returns {Object} authentication response (.token to retrieve token)
 * @throws {Error} in case fetch failed or response is invalid
 */
async function get_token() {
	Debug.log("Getting token for 'Le Barbier Qui Fume'...");

	try {
		const response = await fetch('https://api.synapsy.fr/auth', {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"username": "EXTERNAL:0237",
				"password": "LH5OGBSL29Q1YNNS1GM3IM"
				})
		});
		const json = await response.json();

		if (!response.ok)
			throw new Error(json.error);

		Debug.log("token retrieved !");
		return json;
	}
	catch (error) {
		Debug.error("Failed to fetch with following error: " + error);
		throw error;
	}
}

/**
 * Fetches the list of available shops
 * @param {string} token - authentication token
 * @returns {Array<Object>} list of shops
 * @throws {Error} in case fetch failed or response is invalid
 */
async function get_shops(token) {
	Debug.log("Getting shops for 'Le Barbier Qui Fume'...");

	try {
		const response = await fetch('https://api.synapsy.fr/external/magasin', {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + token
			}
		});
		const json = await response.json();

		if (!response.ok)
			throw new Error(json.error);

		Debug.log("shops parsed !");
		return json;
	}
	catch (error) {
		Debug.error("Failed to fetch with following error: " + error);
		throw error;
	}
}

/**
 * Fetches a list of orders with filters
 * @param {string} token - authentication token
 * @param {number} shop_id - (filter) shop id
 * @param {Date} start_date - (filter) search starting from date
 * @param {Date} end_date - (filter) search up to date
 * @returns {Array<Object>} list of orders
 * @throws {Error} in case fetch failed or response is invalid
 */
async function get_orders(token, shop_id, start_date, end_date) {
	Debug.log("Getting orders for shop id " + shop_id + "...");
	try {
		const response = await fetch('https://api.synapsy.fr/external/commande?' + new URLSearchParams({
			id_magasin_livraison: shop_id,
			date_livraison_s: start_date,
			date_livraison_e: end_date
		}),
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + token
			}
		});
		const json = await response.json();

		if (!response.ok)
			throw new Error(json.error);

		Debug.log("shop orders parsed !");
		return json;
	}
	catch (error) {
		Debug.error("Failed to fetch with following error: " + error);
		throw error;
	}
}

/**
 * Fetches details for a given order
 * @param {string} token - authentication token
 * @param {number} order_id - order id
 * @returns {Object} details of order
 * @throws {Error} in case fetch failed or response is invalid
 */
async function get_order_details(token, order_id) {
	Debug.log("Getting order details for order " + order_id + "...");
	try {
		const response = await fetch('https://api.synapsy.fr/external/commande/' + order_id, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + token
			}
		});
		const json = await response.json();

		if (!response.ok)
			throw new Error(json.error);

		Debug.log("order details parsed !");
		return json;
	}
	catch (error) {
		Debug.error("Failed to fetch with following error: " + error);
		throw error;
	}
}

/**
 * Fetches lines for a given order
 * @param {string} token - authentication token
 * @param {number} order_id - order id
 * @returns {Array<Object>} lines of order
 * @throws {Error} in case fetch failed or response is invalid
 */
async function get_order_lines(token, order_id) {
	Debug.log("Getting order lines for order " + order_id + "...");
	try {
		const response = await fetch('https://api.synapsy.fr/external/commande/' + order_id + '/ligne', {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + token
			}
		});
		const json = await response.json();

		if (!response.ok)
			throw new Error(json.error);

		Debug.log("order lines parsed !");
		return json;
	}
	catch (error) {
		Debug.error("Failed to fetch with following error: " + error);
		throw error;
	}
}

/**
 * Fetches pricing for a given product
 * @param {string} token - authentication token
 * @param {number} product_id - product id
 * @returns {Object} pricing of product
 * @throws {Error} in case fetch failed or response is invalid
 */
async function get_product_pricing(token, product_id) {
	Debug.log("Getting price for product " + product_id + "...");
	try {
		const response = await fetch('https://api.synapsy.fr/external/produit/tarif?' + new URLSearchParams({
			id_produit: product_id,
		}),{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + token
			}
		});
		const json = await response.json();

		if (!response.ok)
			throw new Error(json.error);

		Debug.log("product price parsed !");
		return json[0]; // dunno why it returns a list of identical matches
	}
	catch (error) {
		Debug.error("Failed to fetch with following error: " + error);
		throw error;
	}
}

