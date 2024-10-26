//% weight=100 color=#0fbc11 icon=""
namespace TTSModule {
    let initialized = false;

	//% block="initialize TTS with TX %tx=serial_pin|RX %rx=serial_pin"
	//% tx.defl=SerialPin.P0
	//% rx.defl=SerialPin.P1
	export function initTTS(tx: SerialPin, rx: SerialPin): void {
		serial.redirect(tx, rx, BaudRate.BaudRate9600);
	}

}
