import http from 'https';

const options = {
	method: 'GET',
	hostname: 'twitter-x.p.rapidapi.com',
	port: null,
	path: '/user/details?username=NarayanS1592424',
	headers: {
		'x-rapidapi-key': '47822bb3bemsha001819593243e5p1b709djsn6666ce549748',
		'x-rapidapi-host': 'twitter-x.p.rapidapi.com'
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on('data', function (chunk) {
		chunks.push(chunk);
	});

	res.on('end', function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.end();