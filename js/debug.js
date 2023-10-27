/* todo
  
 give a little love to css, and comment it as well
 probably some 'transition-duration' that I should replace for 'transition'
 
 the scrollbar seems to take some extra height, now the rows are kinda shifted to the top a bit, need to check
 
 
 
 nice green color: #85981C
 nice cyan color: #37D3CC
 nice blue color: #6063D4
 nice orange color: #F98424
 nice pink color: #FD66FD
 
*/


/**
 * Everything related to the debug panel feature
 * Designed to replace 'console.log/warn/error()' that you won't always see, and 'alert()' whose OK button has already been mashed enough ^^
 * I know this is weird in Js, but this is a static class, no constructor, only static methods
 * This does not require any DOM or style, everything is managed here
 * "import Debug from '<wherever you put it>/debug.js'" & use below public methods
 * Public methods :
 *  - Debug.log(<String> message)
 *     -> prints a blue message to the debug panel
 *  - Debug.warn(<String> message)
 *     -> prints a yellow/orange message to the debug panel
 *  - Debug.error(<String> message)
 *     -> prints a red message to the debug panel
 */
export default class Debug {
	
	// DOM variables declaration
	static #debugToggle; 					// #debug-toggle-state-button
	static #debugToggle_open; 				// #debug-toggle-state-button > .inner-on
	static #debugToggle_close; 				// #debug-toggle-state-button > .inner-off
	static #debug; 							// #debug
	static #debugHeader;					// #debug > .header
	static #debugHeaderSummary_clearBtn; 	// #debug > .header > .summary > .clear-button
	static #debugHeaderSummary_logs; 		// #debug > .header > .summary > .logs
	static #debugHeaderSummary_s1; 			// #debug > .header > .summary > .s1
	static #debugHeaderSummary_warnings;	// #debug > .header > .summary > .warnings
	static #debugHeaderSummary_s2; 			// #debug > .header > .summary > .s2
	static #debugHeaderSummary_errors; 		// #debug > .header > .summary > .errors
	static #debugHeaderSummary_s3; 			// #debug > .header > .summary > .s3
	static #debugHeaderSummary_time; 		// #debug > .header > .summary > .time
	static #debugContent 					// #debug > .content
	
	// Private variables declaration
	static #printed_amount;					// amount of messages currently printed to debug panel
	
	
	/** PUBLIC
	 * Prints a blue message to the debug panel
	 */
	static log(message) {
		this.#print(message, "log", this.#escape_angle_brackets((new Error()).stack.match(/at (\S+)/g)[1].slice(3)));
		//                                                         ^-- dirty alternative to arguments.callee / Func.caller methods (gives the caller function / dom element name)
	}
	
	/** PUBLIC
	 * Prints a yellow/orange message to the debug panel
	 */
	static warn(message) {
		this.#print(message, "warning", this.#escape_angle_brackets((new Error()).stack.match(/at (\S+)/g)[1].slice(3)));
		//                                                             ^-- dirty alternative to arguments.callee / Func.caller methods (gives the caller function / dom element name)
	}
	
	/** PUBLIC
	 * Prints a purple message to the debug panel
	 */
	static error(message) {
		this.#print(message, "error", this.#escape_angle_brackets((new Error()).stack.match(/at (\S+)/g)[1].slice(3)));
		//                                                           ^-- dirty alternative to arguments.callee / Func.caller methods (gives the caller function / dom element name)
	}
	
	
	/** PRIVATE
	 * Prints a message to a debug panel, located bottom of page
	 * This is pure Javascript, there's no DOM for it in the page,
	 * meaning this is also responsible for creating and inserting the DOM to the page
	 */
	static #print(message, type, caller) {
		
		// datetime variables
		let now = new Date(),
			dd = String(now.getDate()).padStart(2, '0'),
			mm = String(now.getMonth() + 1).padStart(2, '0'),
			yyyy = now.getFullYear(),
			hh = String(now.getHours()).padStart(2, '0'),
			ii = String(now.getMinutes()).padStart(2, '0'),
			ss = String(now.getSeconds()).padStart(2, '0');
		
		this.#debug = document.querySelector("#debug");
		if (this.#debug == null) { // not in DOM ==> first call ==> insert DOM (check could have been made with any element)
			
			// Insert debug feature to DOM
			document.querySelector("body").insertAdjacentHTML('beforeend', `
				<div id="debug-toggle-state-button">
					<img class="outer" src="img/toggle_outer.png"/>
					<img class="inner-on" src="img/toggle_inner_on.png"/>
					<img class="inner-off" src="img/toggle_inner_off.png"/>
					<div class="info-bubble"><p>Debug panel</p></div>
					</div>
				</div>
				<div id="debug">
					<div class="header">
						<div class="summary">
							<img class="clear-button" src="img/clear_icon.png"/>
							<p class="logs">1 log</p>
							<p class="separator s1">,</p>
							<p class="warnings">1 warning</p>
							<p class="separator s2">,</p>
							<p class="errors">1 error</p>
							<p class="separator s3">since</p>
							<p class="time">${hh}:${ii}:${ss}</p>
						</div>
						<img class="slider-icon" src="img/slider_icon.png"/>
					</div>
					<div class="content">
						<div class="row ${type}">
							<p class="datetime">${dd}/${mm}/${yyyy} ${hh}:${ii}:${ss}</p>
							<p class="ellipsis">...</p>
							<div class="wrapper"> <p class="source">${caller} :</p> </div>
							<p class="same-message-count"></p>
							<p class="message">${message}</p>
						</div>
					</div>
				</div>
				
				<style>
					#debug-toggle-state-button {
						position: fixed;
						width: ${this.DOM_header_height_vw}vw;
						aspect-ratio: 1;
						top: calc(100% - ${this.DOM_header_height_vw + this.DOM_row_height_vw}vw); /** this will be edited **/
						left: calc(100% - ${this.DOM_header_height_vw}vw);
						border-radius: 50%;
						transition: background-color .5s;
						opacity: .5;
						z-index: 1;
					}
					#debug-toggle-state-button:hover {
						background-color: white;
					}

					#debug-toggle-state-button > .outer , #debug-toggle-state-button > .inner-on , #debug-toggle-state-button > .inner-off {
						position: absolute; /* all in the same position (icons are same size 1:1 ratio) */
						width: 100%;
					}

					#debug-toggle-state-button > .inner-off {
						transition-duration: .5s;
					}
					#debug-toggle-state-button:hover > .inner-off {
						filter: invert(100%);
					}

					#debug-toggle-state-button > .inner-on {
						display: none;
						transition-duration: .5s;
					}
					#debug-toggle-state-button:hover > .inner-on {
						filter: invert(100%);
					}
					
					#debug-toggle-state-button > .info-bubble {
						display: none;
						position: absolute;
						top: -2.4vw; /* magic (no autosize text so the box is made to fit the text) */
						left: -6vw; /* magic (no autosize text so the box is made to fit the text) */
						border: 0.15vw solid #0692f6;
						border-radius: 1vw;
						background-color: #0692f6;
						box-shadow: 0 0 1.5vw 0.2vw rgb(0 255 255);
					}
					#debug-toggle-state-button:hover > .info-bubble {
						display: block;
					}

					#debug-toggle-state-button > .info-bubble > p {
						font-size: 1vw;
						line-height: 0;
						font-weight: bold;
						font-style: italic;
						color: white;
						padding: 0 .5vw;
					}

					#debug {
						position: fixed;
						left: 0;
						top: calc(100% - ${this.DOM_header_height_vw + this.DOM_row_height_vw}vw); /** this will be edited **/
						width: 100%;
						height: ${this.DOM_header_height_vw + this.DOM_row_height_vw}vw; /** this will be edited **/
						background-color: #022833;
						opacity: .8;
						z-index: 2;
					}

					#debug > .header {
						width: 100%;
						height: ${this.DOM_header_height_vw}vw;
						display: flex;
						justify-content: flex-start;
						align-items: center;
						background-color: #343440;
					}
					
					#debug > .header > .summary {
						display: inline-flex;
						align-items: center;
						color: #839496;
						font-size: 1.2vw;
						font-weight: bold;
						font-style: italic;
						white-space: nowrap;
						margin-left: 1%;
					}
					
					#debug > .header > .summary > .clear-button {
						height: ${this.DOM_header_height_vw * 3/4}vw;
						aspect-ratio: 1;
						margin-right: 3%;
						border-radius: 50%;
						transition-duration: .5s;
						opacity: .5;
						z-index: 1;
					}
					#debug > .header > .summary > .clear-button:hover {
						filter: invert(100%);
					}
					
					#debug > .header > .summary > .logs {
						color: #37D3CC;
						${ ( type == "log" ? "display: block" : "display: none" ) }
					}
					
					#debug > .header > .summary > .s1 {
						display: none;
					}
					
					#debug > .header > .summary > .warnings {
						color: #F98424;
						${ ( type == "warning" ? "display: block" : "display: none" ) }
					}
					
					#debug > .header > .summary > .s2 {
						display: none;
					}
					
					#debug > .header > .summary > .errors {
						color: #FD66FD;
						${ ( type == "error" ? "display: block" : "display: none" ) }
					}
					
					#debug > .header > .summary > .separator {
						margin: auto 2%;
					}
					
					#debug > .header > .slider-icon {
						position: absolute;
						height: ${this.DOM_header_height_vw * 0.65}vw;
						left: calc(50% - ${this.DOM_header_height_vw * 0.65 * 1.37 / 2}vw); /* horizontally centered (1.37:1 width:height ratio)*/
					}
					#debug > .header > .slider-icon:hover {
						cursor: row-resize;
					}

					#debug > .content {
						height: ${this.DOM_row_height_vw}vw; /** this will be edited **/
						overflow-y: auto;
						display: flex;
						flex-direction: column;
					}
					#debug > .content::-webkit-scrollbar-track {
						background-color: #022833;
					}
					#debug > .content::-webkit-scrollbar {
						background-color: white;
					}
					#debug > .content::-webkit-scrollbar-thumb {
						border-radius: 1vw;
						background-image: -webkit-gradient(linear, left bottom, left top, color-stop(0.44, rgb(122,153,217)), color-stop(0.72, rgb(73,125,189)), color-stop(0.86, rgb(28,58,148)));
					}

					#debug > .content > .row {
						width: 100%;
						height: ${this.DOM_row_height_vw}vw;
						display: inline-flex;
						align-items: center;
						font-size: 1vw;
						font-weight: bold;
						color: #839496;
						opacity: .5;
					}
					#debug > .content > .row.log {
						color: #37D3CC;
					}
					#debug > .content > .row.warning {
						color: #F98424;
					}
					#debug > .content > .row.error {
						color: #FD66FD;
					}
					#debug > .content > .row.warning_max_logs {
						color: white;
					}
					
					#debug > .content > .row > .datetime {
						width: 8%;
						min-width: 8%;
						font-size: .8vw;
						color: #839496;
						margin-left: 1%;
					}

					#debug > .content > .row > .ellipsis {
						width: auto; /* 0 when hidden */
						margin-left: 1%;
					}
					
					#debug > .content > .row > .wrapper {
						width: 15%;
						min-width: 15%; /* prevents long message from shifting this to the left (still true after putting a wrapper??) */
						display: flex;
					}

					#debug > .content > .row > .wrapper > .source {
						overflow: hidden;
						white-space: nowrap;
						display: inline-flex;
						justify-content: flex-end;
						margin-left: auto;
					}
					
					#debug > .content > .row > .same-message-count {
						margin-left: .5%;
					}

					#debug > .content > .row > .message {
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						margin: 0 .5%;
					}
				</style>
			`);
			
			// init DOM variables
			this.#debugToggle = document.querySelector("#debug-toggle-state-button");
			this.#debugToggle_open = document.querySelector("#debug-toggle-state-button > .inner-on");
			this.#debugToggle_close = document.querySelector("#debug-toggle-state-button > .inner-off");
			this.#debug = document.querySelector("#debug");
			this.#debugHeader = document.querySelector("#debug > .header");
			this.#debugHeaderSummary_clearBtn = document.querySelector("#debug > .header > .summary > .clear-button");
			this.#debugHeaderSummary_logs = document.querySelector("#debug > .header > .summary > .logs");
			this.#debugHeaderSummary_s1 = document.querySelector("#debug > .header > .summary > .s1");
			this.#debugHeaderSummary_warnings = document.querySelector("#debug > .header > .summary > .warnings");
			this.#debugHeaderSummary_s2 = document.querySelector("#debug > .header > .summary > .s2");
			this.#debugHeaderSummary_errors = document.querySelector("#debug > .header > .summary > .errors");
			this.#debugHeaderSummary_s3 = document.querySelector("#debug > .header > .summary > .s3");
			this.#debugHeaderSummary_time = document.querySelector("#debug > .header > .summary > .time");
			this.#debugContent = document.querySelector("#debug > .content");
			
			// shows or hides ellipsis based on displayed source length (only visible when source overflows from its wrapper)
			this.#refreshEllipsises();
			
			// init amount of messages
			this.#printed_amount = 1;
			
			/* Applies initial styles directly to elements
				this is redundant, but I want to be able to access NOT computed styles from these,
				and the only way to retrieve styles from them using '.style' and NOT 'getComputedStyle()'
				is to inject these directly to the elements.
				I wish there would be another way, but whatever
			*/
			this.#debugToggle.style.top = `calc(100% - ${this.DOM_header_height_vw + this.DOM_row_height_vw}vw)`;
			this.#debug.style.top = `calc(100% - ${this.DOM_header_height_vw + this.DOM_row_height_vw}vw)`;
			this.#debug.style.height = `${this.DOM_header_height_vw + this.DOM_row_height_vw}vw`;
			this.#debugHeader.style.height = `${this.DOM_header_height_vw}vw`;
			this.#debugContent.style.height = `${this.DOM_row_height_vw}vw`;
			
			// Clear button event listener
			this.#debugHeaderSummary_clearBtn.addEventListener("click", () => {
				// clears debug of all content
				let content = this.#debugContent.querySelectorAll(".row");
				content.forEach(e => e.remove());
				this.#printed_amount = 0;
				
				// updates style
				this.#debugToggle.style.top = `calc(100% - ${this.DOM_header_height_vw}vw)`;
				this.#debug.style.top = `calc(100% - ${this.DOM_header_height_vw}vw)`;
				this.#debug.style.height = `${this.DOM_header_height_vw}vw`;
				this.#debugContent.style.height = "0vw";
				
				// clears summary
				this.#debugHeaderSummary_clearBtn.style.display = "none";
				this.#debugHeaderSummary_logs.style.display = "none";
				this.#debugHeaderSummary_s1.style.display = "none";
				this.#debugHeaderSummary_warnings.style.display = "none";
				this.#debugHeaderSummary_s2.style.display = "none";
				this.#debugHeaderSummary_errors.style.display = "none";
				this.#debugHeaderSummary_s3.style.display = "none";
				this.#debugHeaderSummary_time.style.display = "none";
			});
			
			// Toggle state buttons event listeners
			this.#debugToggle_close.addEventListener("click", () => {
				this.#debug.style.visibility = "hidden";
				this.#debugToggle_close.style.display = "none";
				this.#debugToggle_open.style.display = "block";
			});
			this.#debugToggle_open.addEventListener("click", () => {
				this.#debug.style.visibility = "visible";
				this.#debugToggle_open.style.display = "none";
				this.#debugToggle_close.style.display = "block";
			});
			
			// Window resize event listener
			window.onresize = function() {
				// refreshes ellipsises display
				Debug.#refreshEllipsises();
			}
			
			// the debug panel header will act as a slidebar for the debug panel (along Y-axis)
			this.#init_slider();
			
		}
		
		else { // already in DOM ==> NOT first call ==> update DOM
		
			// In case same message is being printed over => display the amount of times in a bubble before the message instead of printing the same message over
			let last_row = this.#debugContent.querySelector(".row:last-child");
			let previous_type = last_row ? last_row.classList[1] : "";
			let previous_caller = last_row ? last_row.querySelector(".wrapper > .source").innerHTML : "";
			let previous_message = last_row ? last_row.querySelector(".message").innerHTML : "";
			if (type == previous_type && this.#escape_angle_brackets(caller) == previous_caller.substring(0, previous_caller.length - " :".length) && message == previous_message) {
				let same_message_count = last_row.querySelector(".same-message-count");
				let last_count = same_message_count.innerHTML == "" ? 1 : parseInt(same_message_count.innerHTML.substring("(".length, same_message_count.innerHTML.length - ")".length));
				same_message_count.innerHTML = ((last_count < this.max_same_logs) ?
					"(" + (last_count + 1) + ")" :
					"(" + this.max_same_logs + "+)");
				return;
			}
		
			// In case max amount of messages was already printed AND notifier wasn't displayed already => show notifier for lockdown (prevents displaying any more messages untill cleared)
			if (this.#printed_amount == this.max_logs) {
				this.#debugContent.insertAdjacentHTML('beforeend', `
					<div class="row warning_max_logs">
						<p class="datetime">${dd}/${mm}/${yyyy} ${hh}:${ii}:${ss}</p>
						<p class="ellipsis">...</p>
						<div class="wrapper"> <p class="source">-- MAX LOGS REACHED -- :</p> </div>
						<p class="same-message-count"></p>
						<p class="message">Max logs limit was reached, the debug panel won't display any more messages unless it is cleared!</p>
					</div>
				`);
				this.#refreshEllipsises(this.#printed_amount - 1); // ellipsis display (only the last one, others where already parsed)
				this.#debugContent.scrollTop = this.#debugContent.scrollHeight; // scroll to end
				this.#printed_amount++; // increments one last time to differentiate between notifier not displayed and already displayed 
			}
			
			// In case max amount of messages was already printed AND notifier was already displayed => do nothing
			if (this.#printed_amount >= this.max_logs)
				return;
			
			// Insert new row to debug panel
			this.#debugContent.insertAdjacentHTML('beforeend', `
				<div class="row ${type}">
					<p class="datetime">${dd}/${mm}/${yyyy} ${hh}:${ii}:${ss}</p>
					<p class="ellipsis">...</p>
					<div class="wrapper"> <p class="source">${caller} :</p> </div>
					<p class="same-message-count"></p>
					<p class="message">${message}</p>
				</div>
			`);
			this.#printed_amount++;
			this.#refreshEllipsises(this.#printed_amount - 1); // ellipsis display (only the last one, others where already parsed)
			
			// Adjust debug panel style to fit new row
			if (this.#parse_float("%fvw", this.#debugContent.style.height) < (3 * this.DOM_row_height_vw)) { // avoids shrinking if user enlarged the panel (or computing again when at max rows displayed already)
				let rows_n = this.#debugContent.querySelectorAll(".row").length;
				//this.#debugToggle.style.top = `calc(100% - ${Math.min(2 + (2 * rows_n) , 8)}vw)`;
				//       bottom align to bottom page --^                ^      ^           ^
				//                               header is 2vw height --┘      |           └-- displays 3 rows max (+ header) (unless user uses the slidebar)
				//                                                             └-- each row is 2vw height
				// after refactor : (I'm leaving the above now deprecated computation because it's much more reader-friendly)
				this.#debugToggle.style.top = `calc(100% - ${Math.min(this.DOM_header_height_vw + (this.DOM_row_height_vw * rows_n) , 3 * this.DOM_row_height_vw + this.DOM_header_height_vw)}vw)`;
				//this.#debug.style.top = `calc(100% - ${Math.min(2 + (2 * rows_n) , 8)}vw)`;
				// bottom align to bottom page --^              ^      ^           ^
				//                       header is 2vw height --┘      |           └-- displays 3 rows max (+ header) (unless user uses the slidebar)
				//                                                     └-- each row is 2vw height
				// after refactor : (I'm leaving the above now deprecated computation because it's much more reader-friendly)
				this.#debug.style.top = `calc(100% - ${Math.min(this.DOM_header_height_vw + (this.DOM_row_height_vw * rows_n) , 3 * this.DOM_row_height_vw + this.DOM_header_height_vw)}vw)`;
				//this.#debug.style.height = Math.min(2 + (2 * rows_n) , 8) + "vw";
				//           header is 2vw height --^      ^           ^ displays 3 rows max (+ header) (unless user uses the slidebar)
				//                                         └-- each row is 2vw height
				// after refactor : (I'm leaving the above now deprecated computation because it's much more reader-friendly)
				this.#debug.style.height = Math.min(this.DOM_header_height_vw + (this.DOM_row_height_vw * rows_n) , 3 * this.DOM_row_height_vw + this.DOM_header_height_vw) + "vw";
				//this.#debugContent.style.height = Math.min(2 * rows_n , 6) + "vw";
				//                  each row is 2vw height --^          ^ displays 3 rows max (unless user uses the slidebar)
				// after refactor : (I'm leaving the above now deprecated computation because it's much more reader-friendly)
				this.#debugContent.style.height = Math.min(this.DOM_row_height_vw * rows_n , 3 * this.DOM_row_height_vw) + "vw";
				}
			
			// scroll to end (even when no scrolling yet, won't do anything if no scrolling)
			this.#debugContent.scrollTop = this.#debugContent.scrollHeight;
			
			// Update summary
			this.#debugHeaderSummary_clearBtn.style.display = "block"; // in case user cleared debug
			let logs_n = this.#debugContent.querySelectorAll(".row.log").length; // amount of logs in debug
			let warnings_n = this.#debugContent.querySelectorAll(".row.warning").length; // amount of warnings in debug
			let errors_n = this.#debugContent.querySelectorAll(".row.error").length; // amount of errors in debug
			if (logs_n > 0) {
				this.#debugHeaderSummary_logs.innerHTML = logs_n + " log" + (logs_n > 1 ? "s" : "");
				this.#debugHeaderSummary_logs.style.display = "block";
			}
			else {
				this.#debugHeaderSummary_logs.style.display = "none";
			}
			if (warnings_n > 0) {
				this.#debugHeaderSummary_warnings.innerHTML = warnings_n + " warning" + (warnings_n > 1 ? "s" : "");
				this.#debugHeaderSummary_warnings.style.display = "block";
			}
			else {
				this.#debugHeaderSummary_warnings.style.display = "none";
			}
			if (errors_n > 0) {
				this.#debugHeaderSummary_errors.innerHTML = errors_n + " error" + (errors_n > 1 ? "s" : "");
				this.#debugHeaderSummary_errors.style.display = "block";
			}
			else {
				this.#debugHeaderSummary_errors.style.display = "none";
			}
			switch((logs_n > 0 ? 1 : 0) + (warnings_n > 0 ? 1 : 0) + (errors_n > 0 ? 1 : 0)) {
				case 1:
					// only 1 type of debug => no separator
					this.#debugHeaderSummary_s1.style.display = "none";
					this.#debugHeaderSummary_s2.style.display = "none";
					break;
				case 2:
					// only 2 types of debug => corresponding separator 
					this.#debugHeaderSummary_s1.style.display = ((logs_n > 0 && warnings_n > 0) ? "block" : "none");
					this.#debugHeaderSummary_s2.style.display = ((logs_n > 0 && warnings_n > 0) ? "none" : "block");
					break;
				case 3:
					// all 3 types of debug => both separators
					this.#debugHeaderSummary_s1.style.display = "block";
					this.#debugHeaderSummary_s2.style.display = "block";
					break;
				default: // shouldn't happen
					console.log("[debug.js @ #print()] Err. default in switch, should not happen");
					break;
			}
			this.#debugHeaderSummary_s3.style.display = "block"; // in case user cleared debug
			this.#debugHeaderSummary_time.style.display = "block"; // in case user cleared debug
			this.#debugHeaderSummary_time.innerHTML = this.#debugContent.querySelector(".row > .datetime").innerHTML.substring("dd/mm/yyyy ".length);
		}
	}
	
	/** PRIVATE
	 * Returns a copy of given string, with '<' and '>' symbols escaped
	 * This is useful because the source might be a DOM element, thus having those characters in its name
	 */
	static #escape_angle_brackets(string) {
		return string.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
	}
	
	/** PRIVATE
	 * Refreshes the display of ellipsises accross the debug panel rows
	 * i.e. shows them when source is overflowing, hides them otherwise
	 * A starting index can be used in order to avoid running this on every row when not necessary (e.g. when adding a row)
	 * We do need to run it from index 0 when resizing the window though
	 * note: actually this might be an unecessary waste of resources since all text size is in 'vw' units anyway so it will resize with the window..
	 */
	static #refreshEllipsises(startIdx = 0) {
		let wrapper = [] , source = [] , ellipsis = [];
		let wrapper_rect = [] , source_rect = [];
		
		let rows = this.#debugContent.querySelectorAll(".row");
		for (let i = startIdx ; i < rows.length ; i++) {
			wrapper = rows[i].querySelector(".wrapper");
			source = wrapper.querySelector(".source");
			ellipsis = rows[i].querySelector(".ellipsis");
			wrapper_rect = wrapper.getBoundingClientRect();
			source_rect = source.getBoundingClientRect();
			
			ellipsis.style.visibility = ((source_rect.width == wrapper_rect.width) ? "visible" : "hidden");
		}
	}
	
	/** PRIVATE
	 * Makes the debug panel slideable along Y-axis
	 * '#debug > .header' will be the slidebar
	 */
	static #init_slider() {
		/* Variables declaration
			I preserve 'vw' units and not raw pixels because I don't want it to break when user resizes the window
			I use templates because user will likely slide multiple times, and it'd be overkill to store static variables for remembering where it was (here I just look for initial values and add to them)
			Those templates are obviously the same as when initially styled in DOM (yes this is a bit redundant, but at least it's more readable than a parser, and much simpler as well)
		*/
		const debugToggle_style_top_template = "calc(100% - %fvw)";	// template for the '#debug-toggle-state-button'->top css property
		var debugToggle_style_top_offset_start = 0;					// initial value of above '%f' (float) when slide starts
		const debug_style_top_template = "calc(100% - %fvw)";		// template for the '#debug'->top css property
		var debug_style_top_offset_start = 0;						// initial value of above '%f' (float) when slide starts
		const debug_style_height_template = "%fvw";					// template for the '#debug'->height css property
		var debug_style_height_offset_start = 0;					// initial value of above '%f' (float) when slide starts
		const debugContent_style_height_template = "%fvw";			// template for the '#debug- > .content'->height css property
		var debugContent_style_height_offset_start = 0;				// initial value of above '%f' (float) when slide starts
		var mouse_start_top = 0;									// initial mouse position (in pixels) when slide starts
		
		// Attach event listener
		this.#debugHeader.onmousedown = (e) => { start_slide(e); }
		
		
		/**
		 * Init variables & attach event listeners for the sliding feature
		 * On 'mousedown' (attached to '#debug > .header')
		 */
		function start_slide(event) {
			event.preventDefault();
			
			// init variables
			mouse_start_top = event.clientY; // in pixels
			debugToggle_style_top_offset_start = Debug.#parse_float(debugToggle_style_top_template, Debug.#debugToggle.style.getPropertyValue('top')); // float value in template
			debug_style_top_offset_start = Debug.#parse_float(debug_style_top_template, Debug.#debug.style.getPropertyValue('top')); // float value in template
			debug_style_height_offset_start = Debug.#parse_float(debug_style_height_template, Debug.#debug.style.getPropertyValue('height')); // float value in template
			debugContent_style_height_offset_start = Debug.#parse_float(debugContent_style_height_template, Debug.#debugContent.style.getPropertyValue('height')); // float value in template
			
			// event listeners
			document.onmousemove = (e) => {
				slide(e); // where the magic happens
			}
			document.onmouseup = (e) => {
				document.onmousemove = null; // stop listening to mouse movement once sliding is over
				document.onmouseup = null;   // stop listening to mouse up once sliding is over
				// still keeps 'mousedown' event since we want to be able to slide more than just once ^^
			}
		}
		
		/**
		 * Edits debug panel style to match sliding movement
		 * On 'mousemove' (attached to document), only when 'mousedown' was triggered on '#debug > .header' previously (see start_slide())
		 */
		function slide(event) {
			event.preventDefault();
			
			// how much 'vw' units is the mouse away from its position when sliding started (along Y-axis)
			let dy_vw = 100 * (mouse_start_top - event.clientY) / window.innerWidth;
			
			// Adjust debug panel style accordingly
			let vh2vw = window.innerHeight / window.innerWidth;
			// '#debug-toggle-state-button' moves along Y-axis (but not so low that we can't even see the header anymore, or so high that it goes above page)
			Debug.#debugToggle.style.top = debugToggle_style_top_template.replace("%f", Math.min(Math.max(debugToggle_style_top_offset_start + dy_vw , Debug.DOM_header_height_vw), 100 * vh2vw));
			// '#debug' moves along Y-axis (but not so low that we can't even see the header anymore, or so high that it goes above page)
			Debug.#debug.style.top = debug_style_top_template.replace("%f", Math.min(Math.max(debug_style_top_offset_start + dy_vw , Debug.DOM_header_height_vw), 100 * vh2vw));
			// '#debug' height is adjusted to preserve bottom alignment to bottom of the page
			Debug.#debug.style.height = debug_style_height_template.replace("%f", Math.min(Math.max(debug_style_height_offset_start + dy_vw , Debug.DOM_header_height_vw), 100 * vh2vw));
			// '#debug > .content' height is adjusted to take all space available
			Debug.#debugContent.style.height = debugContent_style_height_template.replace("%f", Math.min(Math.max(debugContent_style_height_offset_start + dy_vw , 0), 100 * vh2vw - Debug.DOM_header_height_vw));
		}
	}
	
	/** PRIVATE
	 * Parses a float inside a string given a template
	 * will look for '%f' in the template
	 * todo: check that the string matches the template, return 'NaN' if not
	 */
	static #parse_float(template, string) {
		let idx = template.indexOf("%f");
		if (idx < 0) {
			console.error("[debug.js @ #parse_float()] Err. returned a NaN");
			return NaN;
		}
		
		return parseFloat(string.substring(idx, string.length - (template.length - idx - 2)));
	}
	
}

/**
 * Hell I can't declare static const in Javascript
 * here is a dirty solution to it
 * feel free to throw up, it works ^^
 */

// static const Debug.max_logs = 100;
Object.defineProperty(Debug, 'max_logs', {
	// Maximum amount of messages that can be printed to the debug panel
	// Above value, debug will stop printing altogether (untill refreshed)
    value: 100,
    writable : false,
    enumerable : true,
    configurable : false
});

// static const Debug.max_same_logs = 10;
Object.defineProperty(Debug, 'max_same_logs', {
	// Maximum amount of the same message debug panel will print
	// Above value, debug will stop updating that specific message
    value: 10,
    writable : false,
    enumerable : true,
    configurable : false
});

// static const Debug.DOM_header_height_vw = 2;
Object.defineProperty(Debug, 'DOM_header_height_vw', {
	value: 2,
	writable: false,
	enumerable: true,
	configurable: false
});

// static const Debug.DOM_row_height_vw = 2;
Object.defineProperty(Debug, 'DOM_row_height_vw', {
	value: 2,
	writable: false,
	enumerable: true,
	configurable: false
});


