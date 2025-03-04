import type WS from 'jest-websocket-mock';

const acceptConnection = async (server: WS) => {
	await server.nextMessage.then(async (message) => {
		await expect(message).toBe('{"msg":"connect","version":"1","support":["1","pre2","pre1"]}');
		server.send(`{"msg":"connected","session":"session"}`);
	});
};
export const handleConnection = async (server: WS, ...client: Promise<unknown>[]) => {
	await Promise.all([acceptConnection(server), ...client]);
};

export const handleConnectionAndRejects = async (server: WS, ...client: Promise<unknown>[]) => {
	const suggestedVersion = '1';

	return Promise.all([
		server.nextMessage.then((message) => {
			expect(message).toBe('{"msg":"connect","version":"1","support":["1","pre2","pre1"]}');
			return server.send(`{"msg":"failed","version":"${suggestedVersion}"}`);
		}),
		...client,
	]);
};

export const handleMethod = async (server: WS, id: string, method: string, params: string[]) => {
	await server.nextMessage.then(async (message) => {
		await expect(message).toBe(`{"msg":"method","method":"${method}","params":${JSON.stringify(params)},"id":"${id}"}`);
		server.send(`{"msg":"result","id":"${id}","result":1}`);
	});
};

export const handleSubscription = async (server: WS, id: string, streamName: string, streamParams: string) => {
	await server.nextMessage.then(async (message) => {
		await expect(message).toBe(`{"msg":"sub","id":"${id}","name":"stream-${streamName}","params":["${streamParams}"]}`);
		server.send(`{"msg":"ready","subs":["${id}"]}`);
	});
};
export const fireStream = (action: 'changed' | 'removed' | 'added') => {
	return (server: WS, streamName: string, streamParams: string) => {
		return server.send(
			`{"msg":"${action}","collection":"stream-${streamName}","id":"id","fields":{"eventName":"${streamParams}", "args":[1]}}`,
		);
	};
};

export const fireStreamChange = fireStream('changed');
export const fireStreamRemove = fireStream('removed');
export const fireStreamAdded = fireStream('added');
