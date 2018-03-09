const argv = require('yargs')
.option('dry', {
    alias: 'd',
    description: 'Dry Run',
    required: false,
    type: 'boolean',
})
.option('pattern', {
    alias: 'r',
    description: 'Regex pattern',
    required: true,
    type: 'string',
})
.option('ports', {
    alias: 'p',
    description: 'Comma-separated list of ports',
    required: true,
    type: 'string',
})
.option('servers', {
    alias: 's',
    description: 'Comma-separated list of server IP Addresses/Hostnames',
    required: true,
    type: 'string',
})
.argv;

const chalk = require('chalk');
const redis = require("redis");

(async () => {

    for (const server of argv.servers.split(',')) {

        for (const port of argv.ports.toString().split(',')) {

            try {
                var client = redis.createClient(port, server, {
                    retry_strategy: (options) => {
                        return undefined;
                    },
                });

                const keys = await listKeys(client, argv.pattern);

                console.log(chalk.cyan(`Found ${keys.length} key${keys.length > 1? 's' : ''} on ${server}:${port}.`));

                let failedCount = 0;

                const chunkSize = 300;

                for (let i = 0; i < keys.length; i += chunkSize) {
                    const tempKeys = keys.slice(i, i + chunkSize);

                    if (!argv.dry) {
                        const result = await Promise.all(tempKeys.map((key) => deleteKey(client, key)));

                        failedCount += result.filter((item) => !item).length;
                    }

                    console.log(chalk.magenta(`Deleted ${i + tempKeys.length} of ${keys.length} keys.`));
                }

                if (failedCount) {
                    console.log(chalk.red(`Failed to delete ${failedCount} key${failedCount > 1? 's' : ''}.`));
                } else {
                    console.log(chalk.green(`Successfully deleted ${keys.length} key${keys.length > 1? 's' : ''}.`));
                }

            } catch (err) {
                console.error(err);
                console.log(chalk.red(`Failed to connect to ${server}:${port}.`));
            }
            finally {
                client.end(false);
            }
        }
    }
})();

async function listKeys(client, pattern) {
    return new Promise((resolve, reject) => {
        client.keys(pattern, (err, keys) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(keys);
        });
    });
}

async function deleteKey(client, key) {
    return new Promise((resolve, reject) => {
        client.del(key, (err) => {
            if (err) {
                if (err.code === 'MOVED') {
                    resolve(true);
                }else {
                    resolve(false);
                }
                
                return;
            }

            resolve(true);
        });
    });
}