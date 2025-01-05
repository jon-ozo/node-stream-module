const fs = require('node:fs/promises');
// const fs = require('node:fs');
const path = require('path');

// using promises: manages resources but executes slowly
// (async () => {
// 	console.time('Writing...');

// 	const fileHandle = await fs.open('notes.txt', 'w');

// 	for (let i = 0; i < 1000000; i++) {
// 		const buff = Buffer.from(` ${i} `, 'utf-8');
// 		await fileHandle.write(buff);
// 	}

//   fileHandle.close();

// 	console.timeEnd('Writing...');
// })();

// using callback
// (() => {
// 	fs.open('text_file.txt', 'w', (err, fd) => {
// 		console.time('Writing to file...');
// 		try {
// 			if (err) throw new Error('File does not exist');

// 			for (let i = 0; i < 1000000; i++) {
// 				const buff = Buffer.from(` ${i} `, 'utf-8');
// 				fs.writeSync(fd, buff);
// 			}

// 			fs.close(fd);
// 		} catch (e) {
// 			console.log(e.message);
// 		}

// 		console.timeEnd('Writing to file...');
// 	});
// })();

// using streams: this is way faster and more memory efficient cos
// data is moved in chunks and not as a whole
(async () => {
	console.time('Streaming...');

	const fileHandle = await fs.open(path.join(__dirname, 'notes.txt'), 'w');
	const stream = fileHandle.createWriteStream();

	console.log(stream.writableHighWaterMark);

	let i = 0;
	const writeToBuffer = () => {
		while (i < 500000000) {
			const buff = Buffer.from(` ${i} `, 'utf-8');

			if (i == 499999999) {
				return stream.end(buff);
			}

			i++;

			if (!stream.write(buff)) break;
		}
	};
	writeToBuffer();

	stream.on('drain', () => {
		writeToBuffer();
	});

	stream.on('finish', () => {
		fileHandle.close();
		console.timeEnd('Streaming...');
	});
})();

// const file = fs.createWriteStream(path.join(__dirname, 'text_file.txt'), {
// 	flag: 'a',
// 	encoding: 'utf8',
// 	highWaterMark: 1634,
// });

// for (let i = 0; i < 1000; i++) {
// 	const buff = Buffer.from('Yo!');
// 	file.write(buff, (err) => {
// 		if (err) throw err;
// 	});
// }
