const { pipeline } = require('node:stream/promises');
const fs = require('node:fs/promises');

// using a custom stream
// (async () => {
// 	const readFileHandle = await fs.open('../readable-stream/dest-even.txt', 'r');
// 	const copyFileHandle = await fs.open('copied.txt', 'w');
// 	let bytesRead = -1;

// 	while (bytesRead !== 0) {
// 		const read = await readFileHandle.read();
// 		bytesRead = read.bytesRead;

// 		if (bytesRead !== 16384) {
//       const indexOfZeroFilled = read.buffer.indexOf(0);
//       const buff = new Buffer.alloc(indexOfZeroFilled);
//       read.buffer.copy(buff, 0, 0, indexOfZeroFilled);
//       await copyFileHandle.write(buff);
//     } else {
//       const copy = await copyFileHandle.write(read.buffer);
//       console.log(copy);
// 			readFileHandle.close();
// 		}
// 	}
// })();

// using pipe(): PS - Does not handle streaming errors
// (async () => {
// 	console.time('Done');

// 	const readFileHandle = await fs.open('../readable-stream/dest-even.txt', 'r');
// 	const copyFileHandle = await fs.open('copied.txt', 'w');
// 	const readStream = readFileHandle.createReadStream();
// 	const copyStream = copyFileHandle.createReadStream();

// 	readStream.pipe(copyStream);
// 	readStream.on('end', () => {
// 		console.timeEnd('Done');
// 	});
// })();

// using pipeline(): Handles streaming errors
(async () => {
	const readFileHandle = await fs.open('../readable-stream/dest-even.txt', 'r');
	const copyFileHandle = await fs.open('copied.txt', 'w');
	const readStream = readFileHandle.createReadStream();
	const copyStream = copyFileHandle.createWriteStream();

	await pipeline(readStream, copyStream);
})().catch((err) => {
	console.log(`Something went wrong. ${err}`);
});
