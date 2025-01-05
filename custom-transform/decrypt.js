const { Transform, pipeline } = require('node:stream');
const { open } = require('node:fs/promises');

class Decrypt extends Transform {
	_transform(chunk, encoding, callback) {
		for (let i = 0; i < chunk.length; i++) {
			if (chunk[i] !== 255) {
				chunk[i] -= 1;
			}
		}
		callback(null, chunk);
	}
}

(async () => {
	const decrypt = new Decrypt();
	const readFileHandle = await open('write-text.txt', 'r');
	const size = (await readFileHandle.stat()).size / 100;
	let status = 0;
	const writeFileHandle = await open('decrypted-write-text.txt', 'w');
	const readStream = readFileHandle.createReadStream();
	const writeStream = writeFileHandle.createWriteStream();

	pipeline(readStream, decrypt, writeStream, (err) => {
		if (err) throw new Error(err);

		if (size) {
			status += 1;
			console.log(`${status}% complete`);
		}
	});
})();
