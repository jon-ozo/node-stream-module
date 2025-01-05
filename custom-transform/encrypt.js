const { Transform, pipeline } = require('node:stream');
const { open } = require('node:fs/promises');

class Encrypt extends Transform {
	_transform(chunk, encoding, callback) {
		for (let i = 0; i < chunk.length; i++) {
			if (chunk[i] !== 255) {
				chunk[i] += 1;
			}
		}
		callback(null, chunk);
	}
}

(async () => {
	const encrypt = new Encrypt();
	const readFileHandle = await open('../custom-writable/huge-text.txt', 'r');
	const writeFileHandle = await open('write-text.txt', 'w');
	const readStream = readFileHandle.createReadStream();
	const writeStream = writeFileHandle.createWriteStream();

	pipeline(readStream, encrypt, writeStream, (err) => {
		if (err) throw new Error(err);
	});
})();
