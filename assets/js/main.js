var MANIFESTVERSION = [0, 3];

var pinStates = {}
var board = {}
pinStates["anbutton"] = ["Analog Input", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["rstbutton"] = ["Reset GPIO (HIGH)", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["spicsbutton"] = ["SPI CS", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["spisckbutton"] = ["SPI SCK", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["spimisobutton"] = ["SPI MISO", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["spimosibutton"] = ["SPI MOSI", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["sdabutton"] = ["I2C SDA", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["sclbutton"] = ["I2C SCL", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["txbutton"] = ["UART TX", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["rxbutton"] = ["UART RX", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["intbutton"] = ["Interrupt Input", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]
pinStates["pwmbutton"] = ["PWM Output", "Digital Input", "Digital Output(Low)", "Digital Output(High)"]

board["mikrobus"] = {}
board["devices"] = []
board["properties"] = []
board["gpios"] = []
board["strings"] = []

board["mikrobus"]["anstate"] = "Analog Input"
board["mikrobus"]["rststate"] = "Reset GPIO (HIGH)"
board["mikrobus"]["spicsstate"] = "SPI CS"
board["mikrobus"]["spisckstate"] = "SPI SCK"
board["mikrobus"]["spimisostate"] = "SPI MISO"
board["mikrobus"]["spimosistate"] = "SPI MOSI"
board["mikrobus"]["sdastate"] = "I2C SDA"
board["mikrobus"]["sclstate"] = "I2C SCL"
board["mikrobus"]["txstate"] = "UART TX"
board["mikrobus"]["rxstate"] = "UART RX"
board["mikrobus"]["intstate"] = "Interrupt Input"
board["mikrobus"]["pwmstate"] = "PWM Output"

PROTOCOL_ID = {
	"SPI": "0xb",
	"I2C": "0x3",
	"PLATFORM": "0xfe"
}
IRQ_TYPE = {
	0: "1",
	1: "2",
	2: "4",
	3: "8",
}
SPI_MODE = {
	0: "0",
	1: "1",
	2: "2",
	3: "3",
	4: "1",
	5: "2"
}

function pinButtonClick(buttonID) {
	var button = document.getElementById(buttonID);
	if (button.getAttribute("currentstate") === undefined)
		button.setAttribute("currentstate", 0);
	var currentstate = button.getAttribute("currentstate");
	currentstate = ++currentstate % (pinStates[buttonID].length);
	document.getElementById(buttonID).innerHTML = pinStates[buttonID][currentstate];
	button.setAttribute("currentstate", currentstate);
	board["mikrobus"][buttonID.replace("button", "state")] = pinStates[buttonID][currentstate];
}

function getmikroBUSPinState(mode) {
	var state;
	if (mode.includes("PWM"))
		state = 4;
	if (mode.includes("UART"))
		state = 7;
	if (mode.includes("I2C"))
		state = 6;
	if (mode.includes("SPI"))
		state = 5;
	if (mode.includes("Reset"))
		state = 2;
	if (mode.includes("Digital") || mode.includes("Input")) {
		if (mode.includes("Input"))
			state = 1;
		else if (mode.includes("Output")) {
			if (mode.includes("High"))
				state = 2;
			else if (mode.includes("Low"))
				state = 3;
		}
	}
	return state;
}


function updateConsole(generate) {
	outmanifest = "<br><br><br>";
	if (!generate) {
		for (i = 0; i < board.devices.length; i++)
			outmanifest += " Device&nbsp;" + board.devices[i].driver + "&nbsp;added<br>"
		for (i = 0; i < board.properties.length; i++)
			outmanifest += " Property&nbsp;" + board.properties[i].name + "&nbsp;added<br>"
		for (i = 0; i < board.gpios.length; i++)
			outmanifest += "GPIO&nbsp;" + board.gpios[i].name + "&nbsp;added<br>"
	}
	else {
		var boardname = document.getElementById("boardname").value;
		var boardurl = document.getElementById("boardurl").value;
		var boardvendor = document.getElementById("boardvendor").value;
		var boardkconfig = document.getElementById("boardkconfig").value;
		var i2c_cport = false;
		var spi_cport = false;
		var string_id = 2;
		var cport_id = 1;
		outmanifest += ";<br>"
		outmanifest += ";&nbsp;" + boardname.toUpperCase();
		outmanifest += "<br>;&nbsp;" + boardurl;
		outmanifest += "<br>;&nbsp;" + boardkconfig.toUpperCase();
		outmanifest += "<br>;<br><br><br>"
		outmanifest += "[manifest-header]<br>"
		outmanifest += "version-major&nbsp;=&nbsp;" + MANIFESTVERSION[0].toString() + "<br>"
		outmanifest += "version-minor&nbsp;=&nbsp;" + MANIFESTVERSION[1].toString() + "<br><br>"
		outmanifest += "[interface-descriptor]<br>"
		outmanifest += "vendor-string-id&nbsp;=&nbsp 1<br>";
		outmanifest += "product-string-id&nbsp;=&nbsp 2<br><br>";
		outmanifest += "[string-descriptor 1]<br>"
		outmanifest += "string&nbsp;=&nbsp" + boardname + "<br><br>"
		outmanifest += "[string-descriptor 2]<br>"
		outmanifest += "string&nbsp;=&nbsp" + boardvendor + "<br><br>"
		outmanifest += "[mikrobus-descriptor]<br>"
		outmanifest += "pwm-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.pwmstate) + "<br>";
		outmanifest += "int-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.intstate) + "<br>";
		outmanifest += "rx-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.rxstate) + "<br>";
		outmanifest += "tx-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.txstate) + "<br>";
		outmanifest += "scl-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.sclstate) + "<br>";
		outmanifest += "sda-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.sdastate) + "<br>";
		outmanifest += "mosi-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.spimosistate) + "<br>";
		outmanifest += "miso-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.spimisostate) + "<br>";
		outmanifest += "sck-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.spisckstate) + "<br>";
		outmanifest += "cs-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.spicsstate) + "<br>";
		outmanifest += "rst-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.rststate) + "<br>";
		outmanifest += "an-state&nbsp;=&nbsp" + getmikroBUSPinState(board.mikrobus.anstate) + "<br><br>";
		outmanifest += "[bundle-descriptor 1]<br>"
		outmanifest += "class&nbsp;=&nbsp0xa<br><br>";
		for (i = 0; i < board.devices.length; i++) {
			if (board.devices[i].protocol == "SPI" && !spi_cport) {
				outmanifest += "<br>[cport-descriptor &nbsp;" + (cport_id++).toString() + "]<br>"
				outmanifest += "bundle&nbsp;=&nbsp;1<br>";
				outmanifest += "protocol&nbsp;=&nbsp0xb<br><br>";
				spi_cport = true;
			}
			else if (board.devices[i].protocol == "I2C" && !i2c_cport) {
				outmanifest += "<br>[cport-descriptor &nbsp;" + (cport_id++).toString() + "]<br>"
				outmanifest += "bundle&nbsp;=&nbsp;1<br>";
				outmanifest += "protocol&nbsp;=&nbsp0x3<br><br>";
				i2c_cport = true;
			}
			else if (board.devices[i].protocol == "PLATFORM") {
				outmanifest += "<br>[cport-descriptor &nbsp;" + (cport_id++).toString() + "]<br>"
				outmanifest += "bundle&nbsp;=&nbsp;1<br>";
				outmanifest += "protocol&nbsp;=&nbsp0xfe<br><br>";
			}

			if (board.devices[i].irq) {
				outmanifest += "<br>[cport-descriptor &nbsp;" + (cport_id++).toString() + "]<br>"
				outmanifest += "bundle&nbsp;=&nbsp;1<br>";
				outmanifest += "protocol&nbsp;=&nbsp0x2<br><br>";
			}
		}
		for (i = 0; i < board.gpios.length; i++) {
			outmanifest += "[cport-descriptor]<br>"
			outmanifest += "class&nbsp;=&nbsp0x2<br><br>";
		}
		for (i = 0; i < board.devices.length; i++) {
			outmanifest += "<br>[device-descriptor &nbsp;" + (i+1).toString() + "]<br>"
			outmanifest += "driver-string-id&nbsp=&nbsp;" + (++string_id).toString() + "<br>"
			outmanifest += "protocol&nbsp;=&nbsp;" + PROTOCOL_ID[board.devices[i].protocol] + "<br>"
			outmanifest += "reg&nbsp;=&nbsp;" + board.devices[i].address + "<br>"
			if (board.devices[i].irq) {
				outmanifest += "irq&nbsp;=&nbsp;" + board.devices[i].irqgpio.toString() + "<br>"
				outmanifest += "irq-type&nbsp;=&nbsp;" + IRQ_TYPE[board.devices[i].irqtype] + "<br>"
			}
			if (board.devices[i].protocol == "SPI") {
				outmanifest += "max-speed-hz&nbsp;=&nbsp;" + board.devices[i].maxspeed.toString() + "<br>"
				outmanifest += "mode&nbsp;=&nbsp;" + SPI_MODE[board.devices[i].mode] + "<br>"
			}
			if (board.properties.length > 0) {
				outmanifest += "prop-link &nbsp;=&nbsp;<"
				for (k = 1; k < board.properties.length; k++)
					outmanifest += k.toString() + "&nbsp;"
			}
			if (board.gpios.length > 0)
				outmanifest += "gpio-link &nbsp;=&nbsp;2<br>"
			outmanifest += "<br>[string-descriptor &nbsp;" + string_id.toString() + "]<br>"
			outmanifest += "string&nbsp;=&nbsp" + board.devices[i].driver + "<br><br>"
		}

	}
	document.getElementById("manifesout").innerHTML = outmanifest;
}

function addDevice() {
	var devicedriverstring = document.getElementById("devicedriverstring").value;
	var deviceprotocol = document.getElementById("deviceprotocol").options[document.getElementById("deviceprotocol").selectedIndex].text;
	var deviceaddress = document.getElementById("deviceaddress").value;
	var devicemaxspeed = document.getElementById("devicemaxspeed").value;
	var deviceirq = document.getElementById("deviceirq").checked;
	var deviceirqgpio = document.getElementById("deviceirqgpio").selectedIndex;
	var deviceirqtype = document.getElementById("deviceirqtype").selectedIndex;
	var devicespimode = document.getElementById("devicespimode").selectedIndex;


	board["devices"].push({
		"driver": devicedriverstring,
		"protocol": deviceprotocol,
		"address": deviceaddress,
		"maxspeed": devicemaxspeed,
		"irq": deviceirq,
		"irqgpio": deviceirqgpio,
		"irqtype": deviceirqtype,
		"mode": devicespimode
	})
	updateConsole(false);
}

function addProperty() {
	var propertyname = document.getElementById("propertyname").value;
	var propertytype = document.getElementById("propertytype").options[document.getElementById("propertytype").selectedIndex].text;
	var propertyvalue = document.getElementById("propertyvalue").value;

	board["properties"].push({
		"name": propertyname,
		"type": propertytype,
		"value": propertyvalue
	})
	updateConsole(false);
}




function addGPIO() {
	var gpioname = document.getElementById("gpioname").value;
	var gpiopin = document.getElementById("gpiopin").options[document.getElementById("gpiopin").selectedIndex].text;

	board["gpios"].push({
		"name": gpioname,
		"pin": gpiopin
	})
	updateConsole(false);
}